import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import styles from './NavBar.module.css';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="12" y2="18"/>
    </svg>
  );
}

export default function NavBar() {
  const { theme, changeTheme, isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const cycleTheme = () => {
    if (theme === 'system') changeTheme('dark');
    else if (theme === 'dark') changeTheme('light');
    else changeTheme('system');
  };

  const themeLabel = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Premium Calculator Home">
          <div className={styles.logoIcon}>
            <CalcIcon />
          </div>
          <span className={styles.logoText}>
            Calc<span className={styles.logoPremium}>Premium</span>
          </span>
        </Link>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            className={styles.iconBtn}
            onClick={cycleTheme}
            aria-label={`Switch theme (current: ${themeLabel})`}
            title={`Theme: ${themeLabel}`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Auth buttons */}
          {isAuthenticated ? (
            <Link to="/profile" className={styles.avatarBtn} aria-label="View profile">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>
                  {user?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.btnGhost} id="nav-login">
                Log in
              </Link>
              <Link to="/register" className={styles.btnPrimary} id="nav-register">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
