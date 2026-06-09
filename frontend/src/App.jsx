import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import CalculatorPage from './pages/Calculator/CalculatorPage';
import HistoryPage from './pages/History/HistoryPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import {
  NotFoundPage,
} from './pages/PlaceholderPages';

export default function App() {
  return (
    <AppShell>
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
    </AppShell>
  );
}
