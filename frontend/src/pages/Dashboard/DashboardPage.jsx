import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_calculations: 0,
    today_calculations: 0,
    week_calculations: 0,
    recent_calculations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format timestamp to user-friendly local date string
  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get current date string for welcome card
  const getGreetingDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.page}>
      {/* Background Decorative Orbs */}
      <div className={styles.orbs} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
      </div>

      <div className={styles.container}>
        {/* Welcome Section */}
        <div className={`${styles.welcomeCard} glass`}>
          <div className={styles.welcomeInfo}>
            <div className={styles.userSection}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>
                  {user?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className={styles.welcomeText}>
                <h1 className="gradient-text">Welcome back, {user?.display_name || 'User'}!</h1>
                <p className={styles.dateLabel}>{getGreetingDate()}</p>
              </div>
            </div>
          </div>
          <div className={styles.welcomeBadge}>
            <span className={styles.badgePulse} />
            Active Session
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert} role="alert">
            <span className={styles.errorText}>{error}</span>
            <button className={styles.btnRetry} onClick={fetchStats}>
              Retry
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          {/* Card 1: Total calculations */}
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>🧮</span>
              <span className={styles.statLabel}>Total Calculations</span>
            </div>
            <div className={styles.statValue}>
              {isLoading ? <div className={styles.statPlaceholder} /> : stats.total_calculations}
            </div>
            <div className={styles.statFooter}>All-time recorded history</div>
          </div>

          {/* Card 2: Today's calculations */}
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>📅</span>
              <span className={styles.statLabel}>Today's Calculations</span>
            </div>
            <div className={styles.statValue}>
              {isLoading ? <div className={styles.statPlaceholder} /> : stats.today_calculations}
            </div>
            <div className={styles.statFooter}>Since UTC 00:00 today</div>
          </div>

          {/* Card 3: This Week Calculations */}
          <div className={`${styles.statCard} glass`}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>📆</span>
              <span className={styles.statLabel}>This Week</span>
            </div>
            <div className={styles.statValue}>
              {isLoading ? <div className={styles.statPlaceholder} /> : stats.week_calculations}
            </div>
            <div className={styles.statFooter}>Since Monday</div>
          </div>
        </div>

        {/* Main Content Grid: Recent activity and quick actions */}
        <div className={styles.mainGrid}>
          {/* Recent Calculations Section */}
          <div className={`${styles.recentCard} glass`}>
            <div className={styles.sectionHeader}>
              <h2>Recent Activity</h2>
              <Link to="/history" className={styles.viewAllLink}>
                View All &rarr;
              </Link>
            </div>

            {isLoading ? (
              <div className={styles.loadingActivity}>
                <div className={styles.spinner} />
                <p>Loading activity...</p>
              </div>
            ) : stats.recent_calculations.length === 0 ? (
              <div className={styles.emptyActivity}>
                <div className={styles.emptyIcon}>📜</div>
                <h3>No Recent Activity</h3>
                <p>Evaluate some expressions to populate your statistics.</p>
                <Link to="/calculator" className={styles.btnAction}>
                  Open Calculator
                </Link>
              </div>
            ) : (
              <div className={styles.activityListContainer}>
                <ul className={styles.activityList} role="list">
                  {stats.recent_calculations.map((item) => (
                    <li key={item.id} className={styles.activityItem}>
                      <div className={styles.activityDetails}>
                        <div className={styles.activityExpression}>
                          {item.expression}
                        </div>
                        <div className={styles.activityResult}>
                          = {item.result}
                        </div>
                      </div>
                      <span className={styles.activityTime}>
                        {formatTimestamp(item.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Actions Card Grid */}
          <div className={styles.actionsContainer}>
            <h2 className={styles.sectionTitle}>Quick Navigation</h2>
            <div className={styles.actionsGrid}>
              {/* Quick Calculator */}
              <Link to="/calculator" className={`${styles.actionCard} glass`}>
                <div className={styles.actionIcon}>🧮</div>
                <div className={styles.actionText}>
                  <h3>Calculator</h3>
                  <p>AST-safe parser engine</p>
                </div>
                <div className={styles.actionArrow}>&rarr;</div>
              </Link>

              {/* Quick History */}
              <Link to="/history" className={`${styles.actionCard} glass`}>
                <div className={styles.actionIcon}>📜</div>
                <div className={styles.actionText}>
                  <h3>History</h3>
                  <p>Manage past calculations</p>
                </div>
                <div className={styles.actionArrow}>&rarr;</div>
              </Link>

              {/* Quick Profile */}
              <Link to="/profile" className={`${styles.actionCard} glass`}>
                <div className={styles.actionIcon}>👤</div>
                <div className={styles.actionText}>
                  <h3>Profile</h3>
                  <p>Preferences & details</p>
                </div>
                <div className={styles.actionArrow}>&rarr;</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
