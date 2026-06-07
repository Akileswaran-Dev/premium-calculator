import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // User Stats State
  const [stats, setStats] = useState({ total_calculations: 0, calculations_today: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch real statistics from the backend on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await userService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load user statistics:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (displayName.trim().length < 2 || displayName.trim().length > 100) {
      setProfileError('Display Name must be between 2 and 100 characters.');
      return;
    }
    if (!nameRegex.test(displayName.trim())) {
      setProfileError('Display Name can only contain letters, spaces, hyphens, and apostrophes.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { data } = await userService.updateMe({ display_name: displayName });
      updateUser({ display_name: data.display_name });
      setProfileSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one digit.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Password changed successfully! Logging out...');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto-logout after 2 seconds to redirect to login page
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.detail || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all devices?')) {
      try {
        await authService.logoutAll();
      } catch (err) {
        console.error('Failed to logout of all sessions:', err);
      } finally {
        await logout();
        navigate('/login');
      }
    }
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        
        {/* Profile Details Card */}
        <div className={`${styles.card} ${styles.profileCard} glass`}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{user?.display_name?.charAt(0).toUpperCase()}</div>
            <h2>{user?.display_name}</h2>
            <p className={styles.email}>{user?.email}</p>
            <p className={styles.joined}>Member since {joinDate}</p>
          </div>

          <hr className={styles.divider} />

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className={styles.editForm}>
              {profileError && <div className={styles.errorText}>{profileError}</div>}
              <div className={styles.inputGroup}>
                <label htmlFor="editName">Display Name</label>
                <input
                  id="editName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className={styles.saveBtn}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayName(user?.display_name || '');
                    setIsEditingProfile(false);
                    setProfileError('');
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.profileActions}>
              {profileSuccess && <div className={styles.successText}>{profileSuccess}</div>}
              <button
                onClick={() => setIsEditingProfile(true)}
                className={`${styles.actionBtn} ${styles.editBtn}`}
              >
                Edit Display Name
              </button>
              <button
                onClick={handleLogoutAll}
                className={`${styles.actionBtn} ${styles.logoutAllBtn}`}
              >
                Sign Out All Devices
              </button>
            </div>
          )}
        </div>

        {/* stats and password change grid columns */}
        <div className={styles.column}>
          
          {/* Stats Box Card */}
          <div className={`${styles.card} ${styles.statsCard} glass`}>
            <h3>Usage Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>
                  {isLoadingStats ? '...' : stats.total_calculations}
                </span>
                <span className={styles.statLbl}>Total Calculations</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>
                  {isLoadingStats ? '...' : stats.calculations_today}
                </span>
                <span className={styles.statLbl}>Calculations Today</span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className={`${styles.card} ${styles.passwordCard} glass`}>
            <h3>Change Password</h3>
            
            {passwordError && <div className={styles.errorText}>{passwordError}</div>}
            {passwordSuccess && <div className={styles.successText}>{passwordSuccess}</div>}

            <form onSubmit={handleChangePassword} className={styles.passwordForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className={styles.changePasswordBtn}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
