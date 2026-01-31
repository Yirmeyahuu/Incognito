import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { generateUsername, validateUsername } from '../../utils/usernameGenerator';

interface UsernameEditorProps {
  currentUsername?: string;
  onSave: (username: string) => Promise<void>;
  className?: string;
}

export const UsernameEditor: React.FC<UsernameEditorProps> = ({
  currentUsername = '',
  onSave,
  className = '',
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUsername(currentUsername);
  }, [currentUsername]);

  const handleGenerate = () => {
    const newUsername = generateUsername();
    setUsername(newUsername);
    setError('');
  };

  const handleSave = async () => {
    const validation = validateUsername(username);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid username');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(username);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setIsEditing(false);
    setError('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Username
        </label>

        {!isEditing ? (
          <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-white font-medium">{username || 'Not set'}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter username"
                maxLength={20}
                disabled={isSaving}
              />

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate Random
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !username.trim()}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Username can contain letters, numbers, and underscores (3-20 characters)
      </p>
    </div>
  );
};