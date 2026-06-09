import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute';
import Spinner from './components/common/Spinner/Spinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const CalculatorPage = lazy(() => import('./pages/Calculator/CalculatorPage'));
const HistoryPage = lazy(() => import('./pages/History/HistoryPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const NotFoundPage = lazy(() =>
  import('./pages/PlaceholderPages').then((module) => ({
    default: module.NotFoundPage,
  }))
);

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<Spinner fullPage size="lg" />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculator"
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
