import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

/* ── Feature Cards Data ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description:
      'Instant calculation with real-time expression evaluation. No lag, no delay — just results.',
  },
  {
    icon: '📜',
    title: 'Persistent History',
    description:
      'Every calculation saved to your personal cloud history. Search, filter, tag, and export anytime.',
  },
  {
    icon: '🔐',
    title: 'Secure by Default',
    description:
      'JWT authentication, bcrypt hashing, and httpOnly cookies. Your data is protected at every layer.',
  },
  {
    icon: '🧮',
    title: 'Scientific Mode',
    description:
      'Beyond basic arithmetic — trigonometry, logarithms, exponents, constants π and e, and more.',
  },
  {
    icon: '🎨',
    title: 'Premium Design',
    description:
      'Glassmorphism interface with dark and light themes, fluid animations, and full keyboard support.',
  },
  {
    icon: '☁️',
    title: 'Cloud Synced',
    description:
      'Your history syncs across all your devices. Log in from anywhere and your data is there.',
  },
];

const STATS = [
  { value: '∞', label: 'Calculations supported' },
  { value: '< 15ms', label: 'Average response time' },
  { value: '100%', label: 'Open source & transparent' },
  { value: '2 clicks', label: 'From sign-up to first calculation' },
];

/* ── Landing Page Component ───────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        {/* Animated background orbs */}
        <div className={styles.orbs} aria-hidden="true">
          <div className={`${styles.orb} ${styles.orb1}`} />
          <div className={`${styles.orb} ${styles.orb2}`} />
          <div className={`${styles.orb} ${styles.orb3}`} />
        </div>

        <div className={styles.heroContent}>
          {/* Badge */}
          <div className={styles.badge} role="text">
            <span className={styles.badgeDot} />
            Premium Calculator Application
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className={styles.headline}>
            The calculator that{' '}
            <span className={styles.gradientText}>remembers</span>{' '}
            everything
          </h1>

          {/* Subheadline */}
          <p className={styles.subheadline}>
            A full-stack, cloud-powered calculator with persistent history,
            scientific mode, and a premium interface — built for people who
            take their calculations seriously.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Link to="/register" className={styles.ctaPrimary} id="hero-get-started">
              Get started free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/login" className={styles.ctaSecondary} id="hero-sign-in">
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <p className={styles.socialProof}>
            No credit card required · Free forever · Open source
          </p>
        </div>

        {/* Calculator Preview Card */}
        <div className={styles.previewWrapper} aria-hidden="true">
          <CalculatorPreview />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className={styles.statsBar} aria-label="Product statistics">
        <div className={styles.statsInner}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section className={styles.features} aria-labelledby="features-heading">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 id="features-heading">
              Everything you need,{' '}
              <span className={styles.gradientText}>nothing you don't</span>
            </h2>
            <p>
              We stripped away the clutter and kept the power. Every feature
              exists for a reason.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((feature, i) => (
              <article key={feature.title} className={styles.featureCard} style={{ '--delay': `${i * 60}ms` }}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className={styles.ctaSection} aria-labelledby="cta-heading">
        <div className={styles.ctaCard}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2 id="cta-heading" className={styles.ctaHeading}>
            Ready to calculate smarter?
          </h2>
          <p className={styles.ctaBody}>
            Join and start saving your calculation history in the cloud.
            Your first calculation is one click away.
          </p>
          <Link to="/register" className={styles.ctaPrimary} id="cta-register">
            Create your free account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>
            © 2026 CalcPremium. Built with React + FastAPI + Supabase.
          </p>
          <div className={styles.footerLinks}>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Calculator Preview (decorative) ──────────────────────────────────────── */

function CalculatorPreview() {
  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div className={styles.calcPreview}>
      {/* Display */}
      <div className={styles.calcDisplay}>
        <div className={styles.calcExpression}>12 × (3 + 4)</div>
        <div className={styles.calcResult}>84</div>
      </div>
      {/* Keypad */}
      <div className={styles.calcKeypad}>
        {buttons.map((row, ri) =>
          row.map((btn) => (
            <button
              key={`${ri}-${btn}`}
              tabIndex={-1}
              className={`${styles.calcBtn} ${
                btn === '=' ? styles.calcBtnEquals :
                ['÷', '×', '−', '+'].includes(btn) ? styles.calcBtnOp :
                ['C', '±', '%'].includes(btn) ? styles.calcBtnFn :
                btn === '0' ? styles.calcBtnZero : ''
              }`}
            >
              {btn}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
