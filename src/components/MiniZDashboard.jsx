/**
 * MiniZDashboard.jsx — Design System Reference
 *
 * This component is the visual reference / design system showcase for the
 * Mini-Z RC application. It is NOT used directly in routing.
 *
 * Color tokens:
 *   --accent:  #e8ff00  (neon yellow)
 *   --accent2: #ff3c00  (hot orange-red)
 *   --accent3: #00d4ff  (electric cyan)
 *   --bg:      #0a0a0b  (near-black)
 *
 * Fonts: Barlow Condensed (headings) · Share Tech Mono (data) · Barlow (body)
 */

import styles from './MiniZDashboard.module.css'

export default function MiniZDashboard() {
  return (
    <div className={styles.showcase}>
      <h1 className={styles.heading}>Mini-Z — Design Reference</h1>

      {/* Color palette */}
      <section>
        <h2 className={styles.sub}>Color Tokens</h2>
        <div className={styles.swatches}>
          {[
            ['--accent',  '#e8ff00', 'Accent Yellow'],
            ['--accent2', '#ff3c00', 'Accent Orange'],
            ['--accent3', '#00d4ff', 'Accent Cyan'],
            ['--bg',      '#0a0a0b', 'Background'],
            ['--bg2',     '#111114', 'Card BG'],
            ['--bg3',     '#1a1a1e', 'Elevated'],
          ].map(([v, hex, name]) => (
            <div key={v} className={styles.swatch}>
              <div style={{ background: hex, width: 48, height: 48, borderRadius: 6, border: '1px solid rgba(255,255,255,.1)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>{hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className={styles.sub}>Typography</h2>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 40, fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>Barlow Condensed</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent3)' }}>Share Tech Mono — 12:34.567</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text)' }}>Barlow — Body text and labels</p>
      </section>

      {/* Badges */}
      <section>
        <h2 className={styles.sub}>Badges</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-yellow">POLE</span>
          <span className="badge badge-orange">FAST LAP</span>
          <span className="badge badge-cyan">QUALIFYING</span>
          <span className="badge badge-muted">COMPLETED</span>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className={styles.sub}>Buttons</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-danger">Danger</button>
        </div>
      </section>
    </div>
  )
}
