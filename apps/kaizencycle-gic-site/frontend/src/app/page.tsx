export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1 className="gold">Civic OS — The Operating System for Democratic Integrity</h1>
        <p>KaizenCycle Initiative is building the world's first civic internet where every act of good is 
           seen, verified, and rewarded. Each citizen becomes a node. Each action becomes an attestation. 
           Together, we form a living ledger that turns trust into a public utility.</p>
        <div className="cta-row">
          <a className="btn primary" href="/executive-summary.pdf" target="_blank" rel="noopener">Executive Summary (PDF)</a>
          <a className="btn" href="/presentation.pdf" target="_blank" rel="noopener">Presentation Deck (PDF)</a>
        </div>
        <p className="small">"We heal as we walk."</p>
      </section>
      <section>
        <div className="grid">
          <div className="card">
            <h3>Reflections (Lab4)</h3>
            <p>Secure citizen journaling &lt;→ ledger snapshots. Earns GIC for verified contributions and shared insights.</p>
          </div>
          <div className="card">
            <h3>Citizen Shield (Lab6)</h3>
            <p>Consent-first identity + policy firewall. Every API call is signed, attested, and auditable.</p>
          </div>
          <div className="card">
            <h3>Open Autonomous Academy (Lab7)</h3>
            <p>AI mentor–apprentice model for STEM and trades. Progress converts to proofs and rewards.</p>
          </div>
          <div className="card">
            <h3>Civic Ledger + GIC</h3>
            <p>Proof-of-Integrity blockchain with mint/burn mechanics. Aligns incentives with public value creation.</p>
          </div>
        </div>
      </section>
      <footer>
        <p className="small">© 2025 KaizenCycle Initiative — Civic OS • KaizenCycle • GIC • OAA</p>
      </footer>
    </main>
  )
}
