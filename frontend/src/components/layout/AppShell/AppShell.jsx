import NavBar from '../NavBar/NavBar';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AppShell.module.css';

/**
 * AppShell — root layout wrapper.
 * Renders: NavBar (top) + optional Sidebar (left) + main content area.
 * Sidebar is only shown for authenticated users (handled inside Sidebar).
 */
export default function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      <NavBar />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main} id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
