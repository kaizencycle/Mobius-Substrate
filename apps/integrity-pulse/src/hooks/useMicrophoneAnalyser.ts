import { useEffect, useRef, useState } from 'react';

export interface MicAnalyserOptions {
  fftSize?: number;          // e.g. 2048
  smoothingTimeConstant?: number; // e.g. 0.8
  minDecibels?: number;      // -90
  maxDecibels?: number;      // -10
  autoStart?: boolean;       // default true
}

export interface MicAnalyser {
  ctx: AudioContext | null;
  analyser: AnalyserNode | null;
  stream: MediaStream | null;
  start: () => Promise<void>;
  stop: () => void;
  // convenience buffers
  getByteTimeDomainData: (arr: Uint8Array) => void;
  getByteFrequencyData: (arr: Uint8Array) => void;
}

export function useMicrophoneAnalyser(opts: MicAnalyserOptions = {}): MicAnalyser {
  const {
    fftSize = 2048,
    smoothingTimeConstant = 0.8,
    minDecibels = -90,
    maxDecibels = -10,
    autoStart = true,
  } = opts;

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);

  const start = async () => {
    if (streamRef.current) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = ctx.createMediaStreamSource(stream);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyser.minDecibels = minDecibels;
      analyser.maxDecibels = maxDecibels;

      source.connect(analyser);

      ctxRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;
      setReady(true);
    } catch (err) {
      console.error('Mic init failed', err);
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      // closing releases mic on some browsers only after tracks are stopped
      ctxRef.current.close();
      ctxRef.current = null;
    }
    analyserRef.current = null;
    setReady(false);
  };

  useEffect(() => {
    if (autoStart) {
      start().catch(console.error);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    get ctx() { return ctxRef.current; },
    get analyser() { return analyserRef.current; },
    get stream() { return streamRef.current; },
    start, stop,
    // TypeScript strict checking: these methods expect Uint8Array<ArrayBuffer>
    // but TypeScript infers Uint8Array<ArrayBufferLike>. Arrays are always ArrayBuffer-backed.
    // @ts-expect-error - TypeScript incorrectly infers ArrayBufferLike, but runtime is correct
    getByteTimeDomainData: (arr: Uint8Array) => analyserRef.current?.getByteTimeDomainData(arr),
    // @ts-expect-error - TypeScript incorrectly infers ArrayBufferLike, but runtime is correct
    getByteFrequencyData: (arr: Uint8Array) => analyserRef.current?.getByteFrequencyData(arr),
  };
}
