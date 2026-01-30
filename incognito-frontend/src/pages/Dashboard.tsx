import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Modal } from '../components/common/Modal';
import { LogoutConfirmModal } from '../components/common/LogoutConfirmModal';
import { ViewMessageModal } from '../components/common/ViewMessageModal';
import { messageApi, linkApi } from '../services/api';
import type { Message } from '../types';
import type { BackendMessage } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [publicLink, setPublicLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Character limit for message preview
  const MESSAGE_PREVIEW_LIMIT = 150;

  // Fetch user's public link
  useEffect(() => {
    const fetchPublicLink = async (): Promise<void> => {
      if (!user) return;

      try {
        const response = await linkApi.getMyLink();
        
        if (response.success && response.data) {
          const link = `${window.location.origin}/u/${response.data.publicId}`;
          setPublicLink(link);
        } else {
          setError('Failed to load your public link');
        }
      } catch (err) {
        setError('Failed to load your public link');
      }
    };

    fetchPublicLink();
  }, [user]);

  // Fetch inbox messages
  useEffect(() => {
    const fetchMessages = async (): Promise<void> => {
      if (!user) return;

      setLoading(true);
      
      try {
        const response = await messageApi.getInbox();
        
        if (response.success && response.data) {
          let messagesData: BackendMessage[] = [];
          
          if (Array.isArray(response.data)) {
            messagesData = response.data as BackendMessage[];
          } else if (typeof response.data === 'object' && response.data !== null) {
            if ('messages' in response.data && Array.isArray(response.data.messages)) {
              messagesData = response.data.messages as BackendMessage[];
            } else if ('data' in response.data && Array.isArray(response.data.data)) {
              messagesData = response.data.data as BackendMessage[];
            }
          }
          
          if (Array.isArray(messagesData) && messagesData.length > 0) {
            const formattedMessages: Message[] = messagesData
              .filter((msg): msg is BackendMessage => {
                return typeof msg === 'object' && 
                       msg !== null &&
                       typeof msg.id === 'string' && 
                       typeof msg.content === 'string' &&
                       (typeof msg.createdAt === 'string' || 
                        (typeof msg.createdAt === 'object' && msg.createdAt !== null));
              })
              .map((msg) => {
                let timestamp: Date;
                if (typeof msg.createdAt === 'string') {
                  timestamp = new Date(msg.createdAt);
                } else if (msg.createdAt && typeof msg.createdAt === 'object') {
                  const fsTimestamp = msg.createdAt as any;
                  if (fsTimestamp._seconds || fsTimestamp.seconds) {
                    const seconds = fsTimestamp._seconds || fsTimestamp.seconds;
                    timestamp = new Date(seconds * 1000);
                  } else if (fsTimestamp.toDate && typeof fsTimestamp.toDate === 'function') {
                    timestamp = fsTimestamp.toDate();
                  } else {
                    timestamp = new Date();
                  }
                } else {
                  timestamp = new Date();
                }
                
                return {
                  id: msg.id,
                  content: msg.content,
                  timestamp,
                  isRead: false,
                  isArchived: false,
                };
              });
            
            setMessages(formattedMessages);
          } else {
            setMessages([]);
          }
          
          setError('');
        } else {
          setError(response.error || 'Failed to load messages');
          setMessages([]);
        }
      } catch (err) {
        setError('Failed to load messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
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
    try {
      const response = await linkApi.regenerateLink();
      if (response.success && response.data) {
        setPublicLink(`${window.location.origin}/u/${response.data.publicId}`);
      } else {
        setError(response.error || 'Failed to regenerate link');
      }
    } catch (err) {
      setError('Failed to regenerate link');
    }
  };

  const handleSignOutClick = (): void => {
    setShowLogoutModal(true);
  };

  const handleConfirmSignOut = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      setError('Failed to sign out');
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMessageClick = (message: Message): void => {
    setSelectedMessage(message);
    setShowViewMessageModal(true);
  };

  const truncateMessage = (content: string, limit: number): { text: string; isTruncated: boolean } => {
    if (content.length <= limit) {
      return { text: content, isTruncated: false };
    }
    
    // Find the last space before the limit to avoid cutting words
    let truncateAt = limit;
    const lastSpace = content.lastIndexOf(' ', limit);
    if (lastSpace > limit * 0.8) { // Only use last space if it's not too far back
      truncateAt = lastSpace;
    }
    
    return {
      text: content.substring(0, truncateAt).trim(),
      isTruncated: true
    };
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo variant="dark" size="sm" showText={false} />
              <div>
                <h1 className="text-lg font-bold">Dashboard</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {user?.displayName || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="hidden sm:flex"
              >
                Share Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOutClick}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Public Link Card */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Your Public Link</h3>
            <div className="flex items-center gap-3 mb-4">
              <code className="flex-1 text-sm bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/5 truncate font-mono text-purple-400">
                {publicLink || 'Loading...'}
              </code>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleCopyLink}
                className="flex-1"
                disabled={!publicLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleRegenerateLink}
                disabled={!publicLink}
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Inbox Stats</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {messages.length}
              </span>
              <span className="text-lg text-gray-400">messages received</span>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Your Messages
          </h2>
        </div>

        {/* Messages Grid */}
        {messages.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No messages yet</h3>
            <p className="text-gray-600">Share your link to start receiving anonymous messages</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {messages.map((message) => {
              const { text: previewText, isTruncated } = truncateMessage(message.content, MESSAGE_PREVIEW_LIMIT);
              
              return (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 hover:bg-[#111111] transition-all group cursor-pointer"
                >
                  {/* Date Label */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received {formatDate(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 group-hover:bg-[#1c1c1c] group-hover:border-purple-500/20 transition-colors">
                    <p className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                      {previewText}
                      {isTruncated && (
                        <span className="text-purple-400 font-medium ml-1">
                          ... See more
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Click indicator */}
                  <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-600 group-hover:text-purple-400 transition-colors">
                    <span>Click to view full message</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
        isLoading={isLoggingOut}
      />

      {/* Share Link Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Inbox Link"
        description="Share this link to receive anonymous messages"
      >
        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <code className="text-sm text-purple-400 break-all font-mono">{publicLink}</code>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCopyLink}
            className="w-full"
          >
            {copied ? '✓ Copied to Clipboard!' : 'Copy Link'}
          </Button>
        </div>
      </Modal>

      {/* View Message Modal */}
      <ViewMessageModal
        isOpen={showViewMessageModal}
        onClose={() => {
          setShowViewMessageModal(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
      />
    </div>
  );
};