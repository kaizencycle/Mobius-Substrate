import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="badge">Cycle 0 — The Dome Awakes</div>
        <h1>Genesis Dome</h1>
        <p className="sub">The Dome is not a company. It is a world — of echoes, crowns, and festivals. What you see here is only the surface.</p>
        <div className="cta">
          <Link href="/hive" className="btn primary">Play: HIVE</Link>
          <Link href="/scroll" className="btn">The Scroll</Link>
        </div>
      </header>
      <div className="container">
        <section className="section">
          <div className="grid">
            <div className="card">
              <h3>Echoes</h3>
              <p>What you create echoes through the Dome.</p>
            </div>
            <div className="card">
              <h3>Crowns</h3>
              <p>Recognition for those who build.</p>
            </div>
            <div className="card">
              <h3>Festivals</h3>
              <p>Celebrations of collective achievement.</p>
            </div>
          </div>
        </section>
      </div>
      <footer className="footer">
        <p className="small">© 2025 Genesis Dome — Only the curious find the scrolls.</p>
      </footer>
    </main>
  )
}
