import React, { useState } from 'react';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from './Button';
import { Input } from './Input';

interface PasswordChangerProps {
  className?: string;
}

export const PasswordChanger: React.FC<PasswordChangerProps> = ({ className = '' }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsChanging(true);

    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // ✅ Step 1: Re-authenticate user (required by Firebase)
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // ✅ Step 2: Update password
      await updatePassword(user, newPassword);

      // Success!
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Password change error:', err);
      
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign in again before changing password');
      } else {
        setError(err.message || 'Failed to change password');
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Change Password
        </h3>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-xs text-green-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Password changed successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Current Password</label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={isChanging}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">New Password</label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isChanging}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Confirm New Password</label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isChanging}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            {showPasswords ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Hide Passwords
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show Passwords
              </>
            )}
          </button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {isChanging ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};