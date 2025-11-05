import { RelayEvt } from "../hooks/useEventStream";

let listeners: ((e: RelayEvt) => void)[] = [];
export function onRelay(cb: (e: RelayEvt) => void) { 
  listeners.push(cb); 
  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
}
export function emitRelay(e: RelayEvt) { 
  for (const l of listeners) l(e); 
}
