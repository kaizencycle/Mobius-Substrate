'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

type Telemetry = {
  agent: string;
  gi: number;           // 0..1
  throughput: number;   // events/sec
  errorRate: number;    // 0..1
};

type GeometryPreset = 'rose' | 'torusKnot' | 'flowerOfLife' | 'lissajous';

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

// Geometry preset vertex shaders
const getVertexShader = (preset: GeometryPreset): string => {
  const baseHeader = `
    attribute float aIndex;
    uniform float uTime, uBass, uMid, uHigh, uScale, uHueBase, uTwist, uTension;
    varying float vHue; varying float vA;
    float n(float x){return fract(sin(x*753.5453)*43758.5453123);}
  `;

  const roseGeometry = `
    void main(){
      float t = aIndex;
      float a = t * 6.28318 * 60.0;
      float Rrose = mix(0.2, 2.4, t) * (0.55 + 0.45*sin(5.0*t*6.28318 + uBass*3.1415));
      float Rtor  = 1.6 + 0.6*sin(a*0.5 + uTime*0.3);
      float R = mix(Rrose, Rtor, uTension);

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

  const torusKnotGeometry = `
    void main(){
      float t = aIndex;
      float p = 3.0 + uBass * 2.0;  // torus knot p parameter
      float q = 5.0 + uMid * 3.0;    // torus knot q parameter
      float a = t * 6.28318 * p;
      float b = t * 6.28318 * q;

      float r = 0.4 + 0.3 * sin(b * 0.5 + uTime * 0.4);
      float R = 1.2 + 0.6 * uTension;

      vec3 p;
      p.x = (R + r * cos(b)) * cos(a);
      p.y = (R + r * cos(b)) * sin(a);
      p.z = r * sin(b) * (1.0 + 0.4 * uHigh);

      p += vec3(n(t*17.0)-.5, n(t*37.0)-.5, n(t*97.0)-.5) * 0.05 * (1.0 + 0.5*uMid);

      float ct = cos(uTime*0.12), st = sin(uTime*0.12);
      p = vec3( ct*p.x + st*p.z, p.y, -st*p.x + ct*p.z ) * uScale;

      vHue = fract(uHueBase + t*0.7 + 0.1*uBass + 0.15*uHigh);
      vA = 0.5 + 0.5*uHigh;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      gl_PointSize = 1.8 + 2.2*uHigh;
    }
  `;

  const flowerOfLifeGeometry = `
    void main(){
      float t = aIndex;
      float ring = floor(t * 19.0);  // 19 circles in flower of life
      float angle = fract(t * 19.0) * 6.28318;
      
      float radius = 0.3 + ring * 0.15;
      float phase = ring * 0.33 + uTime * 0.2;
      
      vec3 p;
      p.x = cos(angle + phase) * radius * (1.0 + 0.3*uBass);
      p.y = sin(angle + phase) * radius * (1.0 + 0.3*uMid);
      p.z = (ring - 9.0) * 0.05 + sin(uTime + ring) * 0.1 * uHigh;

      p += vec3(n(t*17.0)-.5, n(t*37.0)-.5, n(t*97.0)-.5) * 0.04 * (1.0 + 0.4*uMid);

      float ct = cos(uTime*0.12), st = sin(uTime*0.12);
      p = vec3( ct*p.x + st*p.z, p.y, -st*p.x + ct*p.z ) * uScale;

      vHue = fract(uHueBase + ring*0.15 + 0.1*uBass + 0.2*uHigh);
      vA = 0.5 + 0.5*uHigh;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      gl_PointSize = 1.8 + 2.2*uHigh;
    }
  `;

  const lissajousGeometry = `
    void main(){
      float t = aIndex;
      float a = t * 6.28318 * 60.0;
      float freqX = 3.0 + uBass * 2.0;
      float freqY = 5.0 + uMid * 3.0;
      float freqZ = 2.0 + uHigh * 2.0;
      
      float phase = uTime * 0.3;
      float amp = 2.0 + uTension * 1.5;

      vec3 p;
      p.x = cos(a * freqX + phase) * amp;
      p.y = sin(a * freqY + phase * 1.3) * amp * 0.8;
      p.z = sin(a * freqZ + phase * 0.7) * amp * 0.6;

      p += vec3(n(t*17.0)-.5, n(t*37.0)-.5, n(t*97.0)-.5) * 0.06 * (1.0 + 0.6*uMid);

      float ct = cos(uTime*0.12), st = sin(uTime*0.12);
      p = vec3( ct*p.x + st*p.z, p.y, -st*p.x + ct*p.z ) * uScale;

      vHue = fract(uHueBase + t*0.9 + 0.08*uBass + 0.25*uHigh);
      vA = 0.5 + 0.5*uHigh;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      gl_PointSize = 1.8 + 2.2*uHigh;
    }
  `;

  const geometryShaders: Record<GeometryPreset, string> = {
    rose: roseGeometry,
    torusKnot: torusKnotGeometry,
    flowerOfLife: flowerOfLifeGeometry,
    lissajous: lissajousGeometry,
  };

  return baseHeader + geometryShaders[preset];
};

const getFragmentShader = (bloom: boolean): string => `
  varying float vHue; varying float vA;
  uniform float uBloom;
  vec3 h2rgb(float h){
    vec3 s = clamp(abs(fract(h+vec3(0.0,0.6667,0.3333))*6.0-3.0)-1.0,0.0,1.0);
    return s*s*(3.0-2.0*s);
  }
  void main(){
    float d = length(gl_PointCoord-0.5);
    float a = smoothstep(0.6,0.0,d) * vA;
    vec3 col = h2rgb(vHue) * (1.0 - d*0.7);
    
    ${bloom ? `
      // Bloom: add glow based on brightness
      float brightness = dot(col, vec3(0.299, 0.587, 0.114));
      float bloomGlow = smoothstep(0.3, 1.0, brightness) * uBloom * 0.5;
      col += col * bloomGlow;
      a = min(1.0, a + bloomGlow * 0.3);
    ` : ''}
    
    gl_FragColor = vec4(col, a);
  }
`;

export default function SacredViz({ mockData = true }: SacredVizProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [useMic, setUseMic] = useState<boolean>(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<GeometryPreset>('rose');
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<'mic' | 'file' | null>(null);

  // Audio context management
  const audioContextRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; freqs: Uint8Array } | null>(null);

  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      const freqs = new Uint8Array(analyser.frequencyBinCount);
      
      audioContextRef.current = { ctx, analyser, freqs };
      return audioContextRef.current;
    } catch (err) {
      console.log('AudioContext not available:', err);
      return null;
    }
  }, []);

  const startMic = useCallback(async () => {
    const audio = await initAudioContext();
    if (!audio) return;

    try {
      // Stop previous source
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const src = audio.ctx.createMediaStreamSource(stream);
      src.connect(audio.analyser);
      setAudioSource('mic');
    } catch (err) {
      console.log('Mic not available:', err);
      setAudioSource(null);
    }
  }, [initAudioContext]);

  const startFile = useCallback(async (file: File) => {
    const audio = await initAudioContext();
    if (!audio) return;

    try {
      // Stop previous source
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }

      const url = URL.createObjectURL(file);
      const audioEl = new Audio(url);
      audioEl.loop = true;

      const src = audio.ctx.createMediaElementSource(audioEl);
      src.connect(audio.analyser);
      audio.analyser.connect(audio.ctx.destination);

      await audioEl.play();
      audioRef.current = audioEl;
      setAudioSource('file');
    } catch (err) {
      console.log('Audio file play failed:', err);
      setAudioSource(null);
    }
  }, [initAudioContext]);

  useEffect(() => {
    if (useMic) {
      startMic();
    } else if (audioFile) {
      startFile(audioFile);
    }
  }, [useMic, audioFile, startMic, startFile]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize audio context if needed
    if (!audioContextRef.current) {
      initAudioContext();
    }

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

    /*** SHADER materials (shared) ***/
    const COUNT = 60000;
    const geo = new THREE.BufferGeometry();
    const aIndex = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) aIndex[i] = i / COUNT;
    geo.setAttribute('aIndex', new THREE.Float32BufferAttribute(aIndex, 1));

    // one layer per agent
    const layers: { id: string; uniforms: any; mesh: THREE.Points; material: THREE.ShaderMaterial }[] = [];
    for (const agent of AGENT_LAYERS) {
      const uniforms = {
        uTime:   { value: 0 },
        uBass:   { value: 0 },
        uMid:    { value: 0 },
        uHigh:   { value: 0 },
        uScale:  { value: 1.0 },
        uHueBase:{ value: agent.hueBase },
        uTwist:  { value: 0.8 },
        uTension:{ value: 0.35 },
        uBloom:  { value: bloomEnabled ? 1.0 : 0.0 }
      };
      const mat = new THREE.ShaderMaterial({
        uniforms, 
        vertexShader: getVertexShader(preset), 
        fragmentShader: getFragmentShader(bloomEnabled),
        transparent: true, 
        depthWrite: false, 
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Points(geo, mat);
      scene.add(mesh);
      layers.push({ id: agent.id, uniforms, mesh, material: mat });
    }

    // Update shaders when preset or bloom changes
    const updatePreset = (newPreset: GeometryPreset) => {
      layers.forEach(layer => {
        layer.material.vertexShader = getVertexShader(newPreset);
        layer.material.needsUpdate = true;
      });
    };

    const updateBloom = (enabled: boolean) => {
      layers.forEach(layer => {
        layer.uniforms.uBloom.value = enabled ? 1.0 : 0.0;
        layer.material.fragmentShader = getFragmentShader(enabled);
        layer.material.needsUpdate = true;
      });
    };

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
      const currentAudio = audioContextRef.current;
      if (!currentAudio || !currentAudio.freqs) return 0;
      let s = 0, c = 0;
      for (let i = from; i < to && i < currentAudio.freqs.length; i++) { 
        s += currentAudio.freqs[i]; 
        c++; 
      }
      return (s / Math.max(c,1)) / 255;
    };

    function tick() {
      const t = clock.getElapsedTime();
      const currentAudio = audioContextRef.current;
      if (currentAudio && currentAudio.analyser) {
        currentAudio.analyser.getByteFrequencyData(currentAudio.freqs);
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
        L.uniforms.uScale.value = 1.0 + (gi - 0.95) * 3.0;
        L.uniforms.uTwist.value = 0.6 + 1.2 * (err * 0.8 + mid*0.2);
        L.uniforms.uTension.value = 0.25 + 0.35 * Math.min(1, thr/20);
        L.mesh.visible = true;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();

    // Store update functions for preset and bloom changes
    (window as any).__sacredVizUpdatePreset = updatePreset;
    (window as any).__sacredVizUpdateBloom = updateBloom;

    /*** cleanup ***/
    return () => {
      window.removeEventListener('resize', onResize);
      delete (window as any).__sacredVizUpdatePreset;
      delete (window as any).__sacredVizUpdateBloom;
      
      // Stop microphone stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      // Stop audio file playback
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      
      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.ctx.close().catch(() => {});
        audioContextRef.current = null;
      }
      
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [preset, bloomEnabled, mockData, initAudioContext, startMic, startFile, useMic, audioFile]);

  // Update preset when it changes
  useEffect(() => {
    if ((window as any).__sacredVizUpdatePreset) {
      (window as any).__sacredVizUpdatePreset(preset);
    }
  }, [preset]);

  // Update bloom when it changes
  useEffect(() => {
    if ((window as any).__sacredVizUpdateBloom) {
      (window as any).__sacredVizUpdateBloom(bloomEnabled);
    }
  }, [bloomEnabled]);

  return (
    <div style={{height:'100vh',width:'100vw',position:'relative',overflow:'hidden'}}>
      <div ref={mountRef} />
      {/* Control Panel */}
      <div style={{
        position:'fixed', 
        left:12, 
        top:12, 
        zIndex:10,
        display:'flex', 
        flexDirection:'column',
        gap:8, 
        fontFamily:'Inter, ui-sans-serif', 
        color:'#cfd3ff',
        background: 'rgba(5, 5, 9, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <button 
            onClick={()=>{
              setUseMic(true);
              setAudioFile(null);
            }} 
            style={{
              ...btn,
              background: audioSource === 'mic' ? 'rgba(255,255,255,0.15)' : btn.background
            }}
          >
            🎤 Mic
          </button>
          <label style={btn as any}>
            📁 File
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
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <label style={{fontSize:11, opacity:0.8}}>Preset:</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as GeometryPreset)}
            style={{
              ...btn,
              padding: '4px 8px',
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            <option value="rose">🌹 Rose</option>
            <option value="torusKnot">🔮 Torus Knot</option>
            <option value="flowerOfLife">🌸 Flower of Life</option>
            <option value="lissajous">🪞 Lissajous</option>
          </select>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{fontSize:11, opacity:0.8, cursor:'pointer'}}>
            <input
              type="checkbox"
              checked={bloomEnabled}
              onChange={(e) => setBloomEnabled(e.target.checked)}
              style={{marginRight:6}}
            />
            ✨ Bloom
          </label>
        </div>

        <div style={{fontSize:10, opacity:0.6, marginTop:4}}>
          Sacred Viz — Agent Waves
        </div>
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
  color:'#e9e9ff',
  transition: 'all 0.2s ease'
};
