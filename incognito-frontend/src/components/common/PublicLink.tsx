import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from './Button';
import { ShareCardGenerator } from './ShareCardGenerator';
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
            setError(''); // Clear any previous errors
            setRetryCount(0); // Reset retry count on success
            console.log('✅ Real-time update - Link constructed:', fullLink);
            console.log('   Public ID:', userData.publicId);
          } else {
            console.warn('⚠️ No publicId found in user document');
            
            // ✅ NEW: Auto-retry for first-time users
            if (retryCount < 3) {
              console.log(`🔄 Retry attempt ${retryCount + 1}/3 for first-time user...`);
              setRetryCount(prev => prev + 1);
              
              // Retry after 2 seconds
              setTimeout(() => {
                // Force re-fetch by triggering component update
                setIsLoading(true);
              }, 2000);
            } else {
              setError('Link not ready yet. Please try regenerating your link.');
            }
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
  }, [user, retryCount]);

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
    <>
      <div className={`bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all ${className}`}>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Your Public Link
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ✅ NEW: Loading state indicator for first-time users */}
        {isLoading && retryCount > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4 text-xs text-blue-400 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Setting up your link... (Attempt {retryCount}/3)</span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <code className="flex-1 text-sm bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/5 truncate font-mono text-purple-400">
            {isLoading ? 'Loading...' : publicLink || 'No link available'}
          </code>
        </div>

        <div className="flex flex-col gap-3">
          {/* Primary Actions Row */}
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
              disabled={isRegenerating || isLoading}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>

          {/* Share to Social Media Button */}
          <button
            onClick={() => setShowShareModal(true)}
            disabled={!publicLink || isRegenerating || isLoading}
            className="w-full px-3 py-2 text-xs font-medium border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share to Social Media</span>
          </button>
        </div>

        {publicLink && !error && !isLoading && (
          <p className="text-xs text-gray-600 mt-3 text-center">
            Share this link to receive anonymous messages
          </p>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareCardGenerator
          publicLink={publicLink}
          username={user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
