import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../common/Spinner/Spinner';

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Preserves the attempted URL in location.state.from for post-login redirect.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a premium full page spinner while we determine auth state
  if (isLoading) {
    return <Spinner fullPage={true} size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
