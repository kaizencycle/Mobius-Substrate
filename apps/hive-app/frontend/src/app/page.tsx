'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Load Phaser and main.js dynamically
    const script1 = document.createElement('script')
    script1.src = 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.min.js'
    script1.onload = () => {
      // Load main.js after Phaser loads
      const script2 = document.createElement('script')
      script2.src = '/main.js'
      document.body.appendChild(script2)
    }
    document.body.appendChild(script1)
  }, [])

  return (
    <main>
      <div id="hud">
        Shards: <b id="shards">0</b>/7 |
        Cycles: <b id="cycles">0</b> |
        Path: <b id="path">—</b> |
        Shield: <b id="shield">—</b> |
        Sword: <b id="sword">—</b> |
        Compass: <b id="compass">—</b>
      </div>
      <div id="game-container"></div>
    </main>
  )
}
