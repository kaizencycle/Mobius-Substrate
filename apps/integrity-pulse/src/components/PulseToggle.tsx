'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function PulseToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isSacred = pathname?.includes('/sacred');
  
  const toggle = () => {
    if (isSacred) {
      router.push('/');
    } else {
      router.push('/sacred');
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        position:'fixed',
        top:14,
        right:14,
        zIndex:15,
        background:'rgba(255,255,255,0.07)',
        border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:8,
        padding:'6px 12px',
        color:'#eaeaff',
        fontSize:12,
        cursor:'pointer',
        fontFamily:'Inter, ui-sans-serif',
        transition:'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
      }}
    >
      {isSacred ? '🩻 Grid View' : '✨ Sacred Viz'}
    </button>
  );
}
