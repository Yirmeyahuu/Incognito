import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from '../common/Button';
import { linkApi } from '../../services/api'; // ✅ Import API
import type { User } from '../../types';

interface AccountTabProps {
  user: User;
  onDeleteAccount: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ user, onDeleteAccount }) => {
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [inboxEnabled, setInboxEnabled] = useState(user.inboxEnabled ?? true);
  const [isTogglingInbox, setIsTogglingInbox] = useState(false);

  const handleSendPasswordReset = async () => {
    if (!user.email) return;

    setIsSendingReset(true);
    setPasswordResetError('');
    setPasswordResetSent(false);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/too-many-requests') {
        setPasswordResetError('Too many attempts. Please try again later.');
      } else {
        setPasswordResetError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  // ✅ UPDATED: Use backend API instead of direct Firestore
  const handleToggleInbox = async () => {
    setIsTogglingInbox(true);

    try {
      const newStatus = !inboxEnabled;
      
      // Call backend API
      const response = await linkApi.toggleLinkStatus(newStatus);

      if (response.success && response.data) {
        setInboxEnabled(response.data.isActive);
        console.log('✅ Inbox status updated via API to:', response.data.isActive);
      } else {
        throw new Error(response.error || 'Failed to update inbox status');
      }
    } catch (error: any) {
      console.error('Failed to toggle inbox:', error);
      alert(error.message || 'Failed to update inbox status');
      // Revert state on error
      setInboxEnabled(user.inboxEnabled ?? true);
    } finally {
      setIsTogglingInbox(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Change Password Section */}
      <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
          Change Password
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          We'll send a password reset link to your email address
        </p>

        {passwordResetSent && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 text-xs text-green-400 flex items-center gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] sm:text-xs">Password reset email sent! Check your inbox.</span>
          </div>
        )}

        {passwordResetError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 text-[10px] sm:text-xs text-red-400">
            {passwordResetError}
          </div>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={handleSendPasswordReset}
          disabled={isSendingReset}
          className="w-full text-xs sm:text-sm"
        >
          {isSendingReset ? 'Sending...' : 'Send Password Reset Email'}
        </Button>
      </div>

      {/* Inbox Toggle Section */}
      <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
          Message Inbox
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Temporarily disable receiving anonymous messages
        </p>
        
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3">
          <div>
            <p className="text-xs sm:text-sm font-medium text-white">
              {inboxEnabled ? 'Inbox Enabled' : 'Inbox Disabled'}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {inboxEnabled ? 'You can receive messages' : 'Messages are blocked'}
            </p>
          </div>
          <button
            onClick={handleToggleInbox}
            disabled={isTogglingInbox}
            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
              inboxEnabled ? 'bg-purple-500' : 'bg-gray-600'
            } ${isTogglingInbox ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                inboxEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="bg-[#111111] border border-red-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xs sm:text-sm font-semibold text-red-400 uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteAccount}
          className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete Account</span>
        </Button>
      </div>
    </div>
  );
};