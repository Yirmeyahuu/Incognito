import React, { useState } from 'react';

// Import avatar images (you'll need to place these in assets/avatars/)
import avatar1 from '../../assets/avatars/avatar-1.webp';
import avatar2 from '../../assets/avatars/avatar-2.webp';
import avatar3 from '../../assets/avatars/avatar-3.webp';
import avatar4 from '../../assets/avatars/avatar-4.webp';

interface ProfilePhotoSelectorProps {
  currentPhoto?: string;
  onSelect: (photoId: string) => void;
  className?: string;
}

const avatars = [
  { id: 'avatar-1', src: avatar1, label: 'Purple Hat Boy' },
  { id: 'avatar-2', src: avatar2, label: 'Happy Boy' },
  { id: 'avatar-3', src: avatar3, label: 'Business Woman' },
  { id: 'avatar-4', src: avatar4, label: 'Blue Cap Girl' },
];

export const ProfilePhotoSelector: React.FC<ProfilePhotoSelectorProps> = ({
  currentPhoto = 'avatar-1',
  onSelect,
  className = '',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhoto);

  const handleSelect = (photoId: string) => {
    setSelectedPhoto(photoId);
    onSelect(photoId);
  };

  const currentAvatar = avatars.find(a => a.id === selectedPhoto) || avatars[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Selected Avatar - Large */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-1">
            <img
              src={currentAvatar.src}
              alt={currentAvatar.label}
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-purple-500 rounded-full p-2 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400">{currentAvatar.label}</p>
      </div>

      {/* Avatar Selection Grid */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Choose Avatar
        </label>
        <div className="grid grid-cols-4 gap-3">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={`relative group transition-all duration-200 ${
                selectedPhoto === avatar.id
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0a0a0a]'
                  : 'ring-1 ring-white/10 hover:ring-purple-500/50'
              } rounded-full`}
            >
              <div className="w-full aspect-square rounded-full overflow-hidden bg-white">
                <img
                  src={avatar.src}
                  alt={avatar.label}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedPhoto === avatar.id && (
                <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};