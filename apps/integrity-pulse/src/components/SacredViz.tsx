'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Telemetry = {
  agent: string;
  gi: number;           // 0..1
  throughput: number;   // events/sec
  errorRate: number;    // 0..1
};

const AGENT_LAYERS = [
  { id: 'AUREA',  hueBase: 0.11 }, // gold
  { id: 'HERMES', hueBase: 0.58 }, // cyan
  { id: 'EVE',    hueBase: 0.92 }, // magenta
  { id: 'JADE',   hueBase: 0.33 }, // green
  { id: 'ATLAS',  hueBase: 0.67 }, // blue
  { id: 'ECHO',   hueBase: 0.03 }, // ember
];

interface SacredVizProps {
  mockData?: boolean;
}

export default function SacredViz({ mockData = true }: SacredVizProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [useMic, setUseMic] = useState<boolean>(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    /*** THREE bootstrap ***/
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050509, 1);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /*** AUDIO ***/
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    const freqs = new Uint8Array(1024); // Default size, will be updated after analyser creation

    const initAudio = async () => {
      try {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = ctx.createAnalyser(); 
        analyser.fftSize = 2048;
        freqs.length = analyser.frequencyBinCount;
      } catch (err) {
        console.log('AudioContext not available:', err);
      }
    };

    const startMic = async () => {
      if (!ctx || !analyser) await initAudio();
      if (!ctx || !analyser) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);
      } catch (err) { 
        console.log('Mic not available:', err);
      }
    };

    const startFile = (file: File) => {
      if (!ctx || !analyser) {
        initAudio().then(() => {
          if (ctx && analyser && file) startFile(file);
        });
        return;
      }

      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.loop = true;
      
      const src = ctx.createMediaElementSource(audio);
      src.connect(analyser); 
      analyser.connect(ctx.destination);
      
      audio.play().catch((err) => {
        console.log('Audio play failed:', err);
      });
      
      audioRef.current = audio;
    };

    initAudio().then(() => {
      if (useMic) {
        startMic();
      } else if (audioFile) {
        startFile(audioFile);
      }
    });

    /*** SHADER materials (shared) ***/
    const COUNT = 60000;
    const geo = new THREE.BufferGeometry();
    const aIndex = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) aIndex[i] = i / COUNT;
    geo.setAttribute('aIndex', new THREE.Float32BufferAttribute(aIndex, 1));

    const vsh = `
      attribute float aIndex;
      uniform float uTime, uBass, uMid, uHigh, uScale, uHueBase, uTwist, uTension;
      varying float vHue; varying float vA;
      float n(float x){return fract(sin(x*753.5453)*43758.5453123);}
      void main(){
        float t = aIndex;
        float a = t * 6.28318 * 60.0;      // many turns: rose-like
        float Rrose = mix(0.2, 2.4, t) * (0.55 + 0.45*sin(5.0*t*6.28318 + uBass*3.1415));
        float Rtor  = 1.6 + 0.6*sin(a*0.5 + uTime*0.3);
        float R = mix(Rrose, Rtor, uTension); // geometry blend

        vec3 p;
        p.x = cos(a + uTwist*t) * R;
        p.y = (sin(a*0.5) * 0.8 + sin(uTime+t*20.0)*0.02) * (1.0 + 0.6*uHigh);
        p.z = sin(a + uTwist*t) * R;

        p += vec3(n(t*17.0)-.5, n(t*37.0)-.5, n(t*97.0)-.5) * 0.06 * (1.0 + 0.6*uMid);

        float ct = cos(uTime*0.12), st = sin(uTime*0.12);
        p = vec3( ct*p.x + st*p.z, p.y, -st*p.x + ct*p.z ) * uScale;

        vHue = fract(uHueBase + t*0.8 + 0.05*uBass + 0.2*uHigh);
        vA = 0.5 + 0.5*uHigh;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        gl_PointSize = 1.8 + 2.2*uHigh;
      }
    `;
    const fsh = `
      varying float vHue; varying float vA;
      vec3 h2rgb(float h){
        vec3 s = clamp(abs(fract(h+vec3(0.0,0.6667,0.3333))*6.0-3.0)-1.0,0.0,1.0);
        return s*s*(3.0-2.0*s);
      }
      void main(){
        float d = length(gl_PointCoord-0.5);
        float a = smoothstep(0.6,0.0,d) * vA;
        vec3 col = h2rgb(vHue) * (1.0 - d*0.7);
        gl_FragColor = vec4(col, a);
      }
    `;

    // one layer per agent
    const layers: { id: string; uniforms: any; mesh: THREE.Points }[] = [];
    for (const agent of AGENT_LAYERS) {
      const uniforms = {
        uTime:   { value: 0 },
        uBass:   { value: 0 },
        uMid:    { value: 0 },
        uHigh:   { value: 0 },
        uScale:  { value: 1.0 },
        uHueBase:{ value: agent.hueBase },
        uTwist:  { value: 0.8 },
        uTension:{ value: 0.35 }
      };
      const mat = new THREE.ShaderMaterial({
        uniforms, vertexShader: vsh, fragmentShader: fsh,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Points(geo, mat);
      scene.add(mesh);
      layers.push({ id: agent.id, uniforms, mesh });
    }

    /*** telemetry polling ***/
    let telem: Record<string, Telemetry> = {};
    async function pollTelemetry() {
      try {
        const res = await fetch('/api/agents/telemetry');
        if (res.ok) {
          const data: Telemetry[] = await res.json();
          telem = Object.fromEntries(data.map(d => [d.agent, d]));
        }
      } catch (err) {
        // Mock data fallback
        if (mockData) {
          const now = Date.now() / 1000;
          AGENT_LAYERS.forEach((agent, i) => {
            telem[agent.id] = {
              agent: agent.id,
              gi: 0.96 + 0.03 * (0.5 + 0.5 * Math.sin(now*0.1 + i)),
              throughput: 4 + 3 * (0.5 + 0.5 * Math.sin(now*0.35 + i*0.7)),
              errorRate: Math.max(0, 0.02 + 0.02 * Math.sin(now*0.27 + i*1.3))
            };
          });
        }
      }
      setTimeout(pollTelemetry, 1000);
    }
    pollTelemetry();

    /*** animation ***/
    const clock = new THREE.Clock();
    const band = (from: number, to: number) => {
      if (!analyser) return 0;
      let s = 0, c = 0;
      for (let i = from; i < to; i++) { s += freqs[i]; c++; }
      return (s / Math.max(c,1)) / 255;
    };

    function tick() {
      const t = clock.getElapsedTime();
      if (analyser) {
        analyser.getByteFrequencyData(freqs);
      }

      // camera orbit
      camera.position.x = Math.cos(t * 0.15) * 6.0;
      camera.position.z = Math.sin(t * 0.15) * 6.0;
      camera.lookAt(0, 0, 0);

      const bass = band(2, 20), mid = band(20, 120), high = band(120, 512);

      // drive each layer by its agent GI & stats
      layers.forEach((L, idx) => {
        const a = telem[L.id];
        const gi = a?.gi ?? 0.98;
        const err = a?.errorRate ?? 0.01;
        const thr = a?.throughput ?? 1.0;

        L.uniforms.uTime.value = t + idx * 0.13;
        L.uniforms.uBass.value = Math.min(1, bass * (1.0 + thr * 0.03));
        L.uniforms.uMid.value  = Math.min(1, mid  * (1.0 + err * 2.0));
        L.uniforms.uHigh.value = Math.min(1, high * (1.0 + (1.0 - gi) * 3.0));
        L.uniforms.uScale.value = 1.0 + (gi - 0.95) * 3.0;           // GI→scale
        L.uniforms.uTwist.value = 0.6 + 1.2 * (err * 0.8 + mid*0.2); // errors→twist
        L.uniforms.uTension.value = 0.25 + 0.35 * Math.min(1, thr/20);
        L.mesh.visible = true;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();

    /*** cleanup ***/
    return () => {
      window.removeEventListener('resize', onResize);
      audioRef.current?.pause();
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [useMic, audioFile, mockData]);

  return (
    <div style={{height:'100vh',width:'100vw',position:'relative',overflow:'hidden'}}>
      <div ref={mountRef} />
      <div style={{
        position:'fixed', left:12, top:12, zIndex:10,
        display:'flex', gap:8, alignItems:'center', fontFamily:'Inter, ui-sans-serif', color:'#cfd3ff'
      }}>
        <button 
          onClick={()=>{
            setUseMic(true);
            setAudioFile(null);
            audioRef.current?.pause();
          }} 
          style={btn}
        >
          Mic
        </button>
        <label style={btn as any}>
          File
          <input 
            type="file" 
            accept="audio/*" 
            style={{display:'none'}}
            onChange={e=>{
              const file = e.target.files?.[0];
              if (!file) return;
              setAudioFile(file);
              setUseMic(false);
            }} 
          />
        </label>
        <span style={{opacity:.7}}>Sacred Viz — Agent Waves</span>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background:'rgba(255,255,255,0.07)', 
  border:'1px solid rgba(255,255,255,0.15)',
  padding:'6px 10px', 
  borderRadius:8, 
  cursor:'pointer', 
  fontSize:12, 
  color:'#e9e9ff'
};
