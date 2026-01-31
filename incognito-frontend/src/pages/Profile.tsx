import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { LogoutConfirmModal } from '../components/common/LogoutConfirmModal';
import { ProfileTab } from '../components/profile/ProfileTab';
import { AccountTab } from '../components/profile/AccountTab';
import { SettingsTab } from '../components/profile/SettingsTab';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'settings'>('profile');

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      // Step 1: Delete user document from Firestore
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);

      // Step 2: Delete publicLinks document
      if (user.publicId) {
        const linkRef = doc(db, 'publicLinks', user.publicId);
        await deleteDoc(linkRef);
      }

      // Step 3: Delete Firebase Auth user
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
      }

      // Step 4: Clear local storage
      localStorage.clear();
      sessionStorage.clear();

      // Step 5: Redirect to landing page
      navigate('/');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        alert('For security reasons, please sign out and sign in again before deleting your account.');
      } else {
        alert('Failed to delete account. Please try again.');
      }
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      if (user) {
        localStorage.removeItem(`incognito_public_link_${user.uid}`);
      }
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo variant="dark" size="sm" showText={false} />
            <div>
              <h1 className="text-base sm:text-lg font-bold">Profile</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 group"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Tab Navigation - Centered */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex gap-1 sm:gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'account'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Account</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileTab 
            user={user} 
            onSignOut={() => setShowLogoutModal(true)} 
          />
        )}

        {activeTab === 'account' && (
          <AccountTab 
            user={user} 
            onDeleteAccount={() => setShowDeleteModal(true)} 
          />
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
        isLoading={isLoggingOut}
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Warning Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 sm:mb-3 text-white">
              Delete Account?
            </h2>

            {/* Message */}
            <p className="text-xs sm:text-sm md:text-base text-gray-400 text-center mb-4 sm:mb-6 md:mb-8 leading-relaxed">
              This will permanently delete your account, all your messages, and your public link. This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs sm:text-sm"
              >
                {isDeleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};