import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button } from '../common/Button';
import { ProfilePhotoSelector } from '../common/ProfilePhotoSelector';
import { UsernameEditor } from '../common/UsernameEditor';
import type { User } from '../../types';

interface ProfileTabProps {
  user: User;
  onSignOut: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, onSignOut }) => {
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(user.profilePhoto || 'avatar-1');

  const handlePhotoSelect = async (photoId: string) => {
    setIsSavingPhoto(true);
    setPhotoSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePhoto: photoId,
        updatedAt: new Date(),
      });

      setCurrentProfilePhoto(photoId);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 2000);

      console.log('✅ Profile photo updated to:', photoId);
    } catch (error) {
      console.error('Failed to update profile photo:', error);
      alert('Failed to update profile photo');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleUsernameSave = async (username: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: username,
        customUsername: username,
        updatedAt: new Date(),
      });

      console.log('✅ Username updated to:', username);
    } catch (error) {
      console.error('Failed to update username:', error);
      throw new Error('Failed to save username');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Photo Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">
            Profile Photo
          </h3>
          
          {photoSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 text-xs text-green-400 flex items-center gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] sm:text-xs">Profile photo updated!</span>
            </div>
          )}

          <ProfilePhotoSelector
            currentPhoto={currentProfilePhoto}
            onSelect={handlePhotoSelect}
          />
          
          {isSavingPhoto && (
            <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4">Saving...</p>
          )}
        </div>

        {/* Username & Email Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <UsernameEditor
              currentUsername={user.displayName || user.email?.split('@')[0] || 'User'}
              onSave={handleUsernameSave}
            />
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
              Email Address
            </h3>
            <div className="bg-black/50 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3">
              <p className="text-gray-400 text-xs sm:text-sm break-all">{user.email}</p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
          Session
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Sign out of your account on this device
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="w-full sm:w-auto text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};