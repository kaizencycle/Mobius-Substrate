import React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'danger' };
export default function KaizenButton({ variant='primary', children, style, ...rest }: Props){
  const base = {
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: variant==='primary' ? 'linear-gradient(180deg, rgba(64,224,208,0.2), rgba(64,224,208,0.08))' :
               variant==='danger' ? 'rgba(255,87,87,0.12)' : 'rgba(255,255,255,0.06)',
    color: '#F5F8FF',
    cursor: 'pointer'
  } as React.CSSProperties;
  return <button {...rest} style={{...base, ...style}}>{children}</button>
}

