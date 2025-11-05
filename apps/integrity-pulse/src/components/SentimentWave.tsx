'use client';

import React, { useMemo } from 'react';
import { useSentiment } from '../hooks/useSentiment';

export default function SentimentWave() {
  const s = useSentiment('');
  const style = useMemo(() => {
    // IMI 0..1 maps to color + amplitude
    const hue = 20 + (s ? s.imi : 0.5) * 220;       // red→green sweep
    const amp = 4 + (s ? s.polarization : 0.2) * 12; // more polarization = noisier
    const opacity = 0.25 + (s ? s.imi : 0.5) * 0.5;
    return {
      ['--imiHue' as any]: `${hue}`,
      ['--imiAmp' as any]: `${amp}px`,
      ['--imiOpacity' as any]: `${opacity}`,
    };
  }, [s]);

  return (
    <div className="sentiment-wave" style={style} title={`IMI ${s?.imi?.toFixed(3) ?? '–'}`}>
      {/* decorative; semantic text fallback */}
      <span className="sr-only">
        IMI {s?.imi?.toFixed(3)} • pol {s?.polarization?.toFixed(2)}
      </span>
    </div>
  );
}
