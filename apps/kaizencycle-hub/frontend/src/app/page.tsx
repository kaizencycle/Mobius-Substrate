export default function Home() {
  return (
    <main>
      <div className="container header">
        <h1 className="gold">KaizenCycle Initiative</h1>
        <div>"We heal as we walk."</div>
      </div>
      <div className="container">
        <div className="card">
          <h2 className="gold">Civic OS</h2>
          <p>Integrity-first civic infrastructure: Reflections (Lab4), Citizen Shield (Lab6), OAA (Lab7), Civic Ledger, and GIC.</p>
        </div>
        <div className="card">
          <h2 className="gold">Documents</h2>
          <ul>
            <li><a href="/executive-summary.pdf" target="_blank">Executive Summary (PDF)</a></li>
            <li><a href="/presentation.pdf" target="_blank">Presentation Deck (PDF)</a></li>
            <li><a href="/full-set.pdf" target="_blank">Full Set (Branded)</a></li>
          </ul>
        </div>
        <div className="card">
          <h2 className="gold">Contact</h2>
          <p>Email: michael@kaizencycle.org</p>
        </div>
      </div>
    </main>
  )
}
