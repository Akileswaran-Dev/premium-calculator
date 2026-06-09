import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyService } from '../../services/historyService';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch calculation history
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await historyService.getHistory({ limit: 100 });
      setHistory(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load calculation history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete a single history entry
  const handleDeleteEntry = async (id) => {
    if (deletingId) return; // Prevent double clicks
    setDeletingId(id);
    try {
      await historyService.deleteEntry(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(`Failed to delete history item ${id}:`, err);
      setError('Failed to delete history item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all history entries
  const handleClearHistory = async () => {
    if (history.length === 0 || isClearing) return;
    if (!window.confirm('Are you sure you want to clear all your calculation history? This cannot be undone.')) {
      return;
    }
    setIsClearing(true);
    try {
      await historyService.clearHistory();
      setHistory([]);
      setTotal(0);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  // Format timestamp to user-friendly local date string
  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Orbs */}
      <div className={styles.orbs} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
      </div>

      <div className={styles.container}>
        {/* Glass Card Container */}
        <div className={styles.historyCard}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>Calculation History</h1>
              <span className={styles.badge}>{total} entries</span>
            </div>
            {history.length > 0 && (
              <button
                className={styles.btnClear}
                onClick={handleClearHistory}
                disabled={isClearing}
                aria-label="Clear all history"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorText}>{error}</span>
              <button className={styles.btnRetry} onClick={fetchHistory}>
                Retry
              </button>
            </div>
          )}

          {/* Main List / Grid */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📜</div>
              <h2>No Calculations Yet</h2>
              <p>Successful calculations will be recorded automatically here.</p>
              <Link to="/calculator" className={styles.btnLink}>
                Go to Calculator
              </Link>
            </div>
          ) : (
            <div className={styles.listContainer}>
              <ul className={styles.list} role="list">
                {history.map((item) => (
                  <li key={item.id} className={styles.listItem}>
                    <div className={styles.itemContent}>
                      <div className={styles.expressionWrapper}>
                        <span className={styles.expression} title={item.expression}>
                          {item.expression}
                        </span>
                        <span className={styles.equals}>=</span>
                      </div>
                      <div className={styles.resultWrapper}>
                        <span className={styles.result} title={item.result}>
                          {item.result}
                        </span>
                      </div>
                      <span className={styles.timestamp}>
                        {formatTimestamp(item.created_at)}
                      </span>
                    </div>

                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDeleteEntry(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Delete entry"
                      title="Delete entry"
                    >
                      {deletingId === item.id ? (
                        <span className={styles.miniSpinner} />
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
