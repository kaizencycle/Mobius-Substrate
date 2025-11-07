export function giToHue(gi: number){ return 160 + Math.round(70 * Math.min(1, Math.max(0, gi))); }
export function severityFromGI(gi: number): 'gold'|'green'|'amber'|'red'{
  if(gi >= 0.99) return 'gold';
  if(gi >= 0.95) return 'green';
  if(gi >= 0.90) return 'amber';
  return 'red';
}

