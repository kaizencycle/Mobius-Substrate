import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoMark}></span>
            Mobius Systems
          </div>
          <div className={styles.taglineChip}>Integrity Before Intelligence</div>
        </header>

        {/* HERO */}
        <section className={styles.heroSection}>
          <div className={styles.hero}>
            <div>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Kaizen Edition v0.1</span>
                <span className={styles.badge}>Civic AI Substrate</span>
              </div>
              <h1 className={styles.heroHeading}>Intelligence with a spine.</h1>
              <p className={styles.heroSub}>
                Mobius Systems is a civic AI substrate that embeds{' '}
                <strong>integrity, reflection, and consensus</strong> into intelligent
                systems — so they remain answerable to their purpose even as they
                scale.
              </p>
              <div className={styles.heroCta}>
                <a
                  href="https://github.com/kaizencycle/Mobius-Systems/blob/main/book/Integrity_Before_Intelligence.pdf"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <span>Read the book</span>
                </a>
                <a
                  href="https://github.com/kaizencycle/Mobius-Systems"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  <span>Explore the code</span>
                </a>
              </div>
              <div className={styles.heroNote}>
                Not a product pitch. A substrate for researchers, civic builders, and
                stewards.
              </div>
            </div>

            <aside className={styles.heroCard}>
              <div className={styles.heroCardTitle}>Integrity State (Demo)</div>
              <div className={styles.heroCardMain}>
                Structural coherence as a first-class signal — not an afterthought.
              </div>
              <div className={styles.heroMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Mobius Integrity Score</div>
                  <div className={styles.metricValue}>0.97 · Stable</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Consensus Level</div>
                  <div className={styles.metricValue}>0.88 · High</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Reflection Mode</div>
                  <div className={styles.metricValue}>On thresholds</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Agents Online</div>
                  <div className={styles.metricValue}>Atlas · Aurea · Echo</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* PROBLEM */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>The problem</div>
            <h2 className={styles.sectionTitle}>The issue isn&apos;t intelligence. It&apos;s drift.</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Modern AI systems scale faster than we can govern them. Human
              oversight grows linearly. Automation grows exponentially.
            </p>
            <p>
              The result is predictable: systems optimize what they can measure;
              metrics become substitutes for values; institutions forget why their
              systems exist. Performance improves right up to the edge of collapse.
            </p>
            <p>
              Mobius is built around a simple thesis:{' '}
              <strong>intelligence scales power, integrity scales survivability.</strong>
            </p>
          </div>
        </section>

        {/* WHAT IS MOBIUS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Definition</div>
            <h2 className={styles.sectionTitle}>Mobius is a substrate, not an app.</h2>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.sectionBody}>
              <p>
                Mobius Systems is a <strong>civic AI substrate</strong> — an
                architectural layer that existing and future models can run on to
                remain coherent under pressure.
              </p>
              <p>
                Instead of trying to control models from the outside, Mobius treats{' '}
                <strong>integrity as a state variable</strong>, embeds{' '}
                <strong>reflection as a control surface</strong>, and uses{' '}
                <strong>multi-agent consensus</strong> to avoid single points of
                failure.
              </p>
              <p>
                It is model-agnostic, institution-agnostic, and designed to be
                deployed as <strong>digital public infrastructure</strong>, not a
                proprietary black box.
              </p>
            </div>
            <div className={styles.sectionBody}>
              <p><strong>Mobius gives you:</strong></p>
              <ul className={styles.featureList}>
                <li>Continuous integrity monitoring across agents and decisions</li>
                <li>Mandatory reflection before high-impact actions</li>
                <li>Consensus-gated behavior when agents disagree</li>
                <li>Civic memory that preserves reasoning, not just outcomes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Architecture</div>
            <h2 className={styles.sectionTitle}>Three pillars of the substrate</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Under the hood, Mobius implements three architectural primitives from{' '}
              <em>Integrity Before Intelligence</em> and the Kaizen Turing Test
              (KTT): integrity as architecture, reflection as control surface,
              consensus as stabilization.
            </p>
          </div>
          <div className={styles.pillars}>
            <div className={styles.pillarCard}>
              <div className={styles.pillarTitle}>1. Integrity as architecture</div>
              <p>
                Systems track a live integrity state (e.g. Mobius Integrity Score)
                that measures coherence between intent, behavior, and consequence.
                Low integrity doesn&apos;t just raise alerts — it gates what the system
                is allowed to do.
              </p>
            </div>
            <div className={styles.pillarCard}>
              <div className={styles.pillarTitle}>2. Reflection as control surface</div>
              <p>
                Mobius enforces structural pauses at decision boundaries: before
                irreversible actions, when uncertainty spikes, or when agents
                disagree. Reflection is not hesitation — it&apos;s the surface where
                systems question their own behavior.
              </p>
            </div>
            <div className={styles.pillarCard}>
              <div className={styles.pillarTitle}>3. Consensus as stabilization</div>
              <p>
                No single model is treated as an oracle. Multiple agents with
                different architectures evaluate decisions. Disagreement slows or
                halts execution and escalates to human anchors, preventing silent
                cascades.
              </p>
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Who it&apos;s for</div>
            <h2 className={styles.sectionTitle}>People trying to make governance real</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>
              Mobius is early-stage infrastructure. It&apos;s built for people who care
              more about <strong>coherence</strong> than hype: researchers, civic
              technologists, foundations, and builders who want integrity baked into
              the stack.
            </p>
          </div>
          <div className={styles.audiences}>
            <div className={styles.audienceCard}>
              <div className={styles.audienceTitle}>Researchers & AI safety labs</div>
              <p>
                Use Mobius and the Kaizen Turing Test as a substrate for studying
                multi-agent alignment, integrity metrics, reflection triggers, and
                consensus protocols in live systems — not just toy examples.
              </p>
            </div>
            <div className={styles.audienceCard}>
              <div className={styles.audienceTitle}>Civic & philanthropic foundations</div>
              <p>
                Pilot Mobius as civic AI infrastructure: local-first tutoring,
                integrity-aware civic dashboards, and citizen tools aligned with
                democratic governance, not surveillance incentives.
              </p>
            </div>
            <div className={styles.audienceCard}>
              <div className={styles.audienceTitle}>Builders & educators</div>
              <p>
                Integrate Mobius components like the OAA Learning Hub, Reflections
                Lab, and Citizen Shield into real workflows where alignment,
                reflection, and memory actually matter day to day.
              </p>
            </div>
          </div>
        </section>

        {/* ARTIFACTS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Artifacts</div>
            <h2 className={styles.sectionTitle}>What exists today</h2>
          </div>
          <div className={styles.artifacts}>
            <div className={styles.artifactCard}>
              <div className={styles.artifactTag}>Framework</div>
              <div className={styles.artifactTitle}>Book: Integrity Before Intelligence</div>
              <p>
                A 9-chapter framework for understanding optimization drift and
                designing architectures where integrity is a first-class system
                property.
              </p>
              <p className={styles.artifactLink}>
                <a href="https://github.com/kaizencycle/Mobius-Systems/blob/main/book/Integrity_Before_Intelligence.pdf">
                  Read the PDF →
                </a>
              </p>
            </div>
            <div className={styles.artifactCard}>
              <div className={styles.artifactTag}>Evaluation Layer</div>
              <div className={styles.artifactTitle}>
                The Kaizen Turing Test (KTT) Paper
              </div>
              <p>
                Technical foundation for Mobius: integrity metrics (GI / MII),
                Dynamic Virtual Architecture (DVA), and continuous governance
                cadence under stress.
              </p>
              <p className={styles.artifactLink}>
                <a href="https://github.com/kaizencycle/Mobius-Systems/blob/main/papers/KTT_Paper.pdf">
                  View draft →
                </a>
              </p>
            </div>
            <div className={styles.artifactCard}>
              <div className={styles.artifactTag}>Architecture</div>
              <div className={styles.artifactTitle}>Mobius DVA & multi-agent stack</div>
              <p>
                Tiered architecture (LITE → ONE → FULL → HIVE) for distributed
                integrity monitoring and federated consensus across agents, with
                cryptographic attestations.
              </p>
            </div>
            <div className={styles.artifactCard}>
              <div className={styles.artifactTag}>Code & Demo</div>
              <div className={styles.artifactTitle}>Open-source implementation</div>
              <p>
                Kaizen-OS and Mobius-Systems monorepos, with live demo components:
                OAA Learning Hub, Reflections Lab, Citizen Shield, and integrity
                gating utilities.
              </p>
              <p className={styles.artifactLink}>
                <a href="https://github.com/kaizencycle/Mobius-Systems">
                  Visit GitHub →
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.section}>
          <div className={styles.ctaCenter}>
            <div className={styles.sectionKicker}>Invitation</div>
            <h2 className={styles.sectionTitle}>This is stewardship work.</h2>
            <p>
              If you&apos;re working on AI safety, civic tech, or institutional
              resilience and want a live substrate to experiment on, let&apos;s talk.
            </p>
            <a href="mailto:michael@mobiussystems.org" className={`${styles.btn} ${styles.btnPrimary}`}>
              Request a conversation
            </a>
            <div className={styles.ctaSmall}>
              Share who you are, what you&apos;re building, and how Mobius might fit.
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>© 2025 Michael Judan · Mobius Systems</div>
        <div>
          Integrity Before Intelligence · KTT · DVA · Civic AI Substrate ·{' '}
          <a href="mailto:michael@mobiussystems.org">Contact</a>
        </div>
      </footer>
    </>
  );
}
