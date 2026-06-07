import { Link } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function CalculatorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🧮</div>
        <h1>Calculator</h1>
        <p>The full calculator engine is coming in Phase 3.</p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </div>
    </div>
  );
}

export function HistoryPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>📜</div>
        <h1>History</h1>
        <p>Calculation history features are coming in Phase 4.</p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.errorCode}>404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </div>
    </div>
  );
}
