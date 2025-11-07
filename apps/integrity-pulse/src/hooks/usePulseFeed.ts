import { useEffect, useState } from 'react';
export type PulseFeed = { gi: number; entropy: number; eventsPerMin: number };
export function usePulseFeed(url?: string): PulseFeed {
  const [state, setState] = useState<PulseFeed>({ gi: 0.98, entropy: 0.02, eventsPerMin: 1 });
  useEffect(() => {
    let timer: any;
    async function tick(){
      try{
        if(url){
          const r = await fetch(url).then(r=>r.json());
          setState({ gi: r.gi ?? 0.98, entropy: r.entropy ?? 0.02, eventsPerMin: r.eventsPerMin ?? 1 });
        }
      }catch(e){}
      timer = setTimeout(tick, 5000);
    }
    tick();
    return ()=>clearTimeout(timer);
  }, [url]);
  return state;
}

