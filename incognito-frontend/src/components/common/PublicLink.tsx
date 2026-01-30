import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from './Button';
import { linkApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';

interface PublicLinkProps {
  className?: string;
}

export const PublicLink: React.FC<PublicLinkProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ REAL-TIME: Listen to Firestore user document for instant updates
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    console.log('👂 Setting up real-time listener for user:', user.uid);

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          
          // ✅ ALWAYS construct link from publicId using current domain
          if (userData.publicId) {
            const fullLink = `${window.location.origin}/u/${userData.publicId}`;
            setPublicLink(fullLink);
            console.log('✅ Real-time update - Link constructed:', fullLink);
            console.log('   Public ID:', userData.publicId);
          } else {
            console.warn('⚠️ No publicId found in user document');
            setError('No public ID found. Please try regenerating your link.');
          }
        } else {
          console.warn('⚠️ User document does not exist in Firestore');
          setError('User profile not found. Please try signing out and back in.');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ Firestore listener error:', error);
        setError('Failed to load your public link');
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [user]);

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  const handleRegenerateLink = async (): Promise<void> => {
    if (!user) return;

    setIsRegenerating(true);
    setError('');

    try {
      console.log('🔄 Regenerating link via API...');
      
      const response = await linkApi.regenerateLink();
      
      if (response.success && response.data) {
        console.log('✅ Link regenerated successfully:', response.data.publicId);
        // ✅ Firestore listener will automatically update the link
      } else {
        setError(response.error || 'Failed to regenerate link');
      }
    } catch (err) {
      console.error('Error regenerating link:', err);
      setError('Failed to regenerate link');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className={`bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Your Public Link
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <code className="flex-1 text-sm bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/5 truncate font-mono text-purple-400">
          {isLoading ? 'Loading...' : publicLink || 'No link available'}
        </code>
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleCopyLink}
          className="flex-1"
          disabled={!publicLink || isRegenerating || isLoading}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={handleRegenerateLink}
          disabled={!publicLink || isRegenerating || isLoading}
        >
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
      </div>

      {publicLink && !error && !isLoading && (
        <p className="text-xs text-gray-600 mt-3 text-center">
          Share this link to receive anonymous messages
        </p>
      )}
    </div>
  );
};