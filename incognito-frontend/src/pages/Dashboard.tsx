import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Modal } from '../components/common/Modal';
import { LogoutConfirmModal } from '../components/common/LogoutConfirmModal';
import { ViewMessageModal } from '../components/common/ViewMessageModal';
import { PublicLink } from '../components/common/PublicLink';
import { MessageList } from '../components/common/MessageList';
import { messageApi } from '../services/api';
import type { Message } from '../types';
import type { BackendMessage } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                return (
                  typeof msg === 'object' &&
                  msg !== null &&
                  typeof msg.id === 'string' &&
                  typeof msg.content === 'string' &&
                  (typeof msg.createdAt === 'string' ||
                    (typeof msg.createdAt === 'object' && msg.createdAt !== null))
                );
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
                  isRead: msg.isRead || false, // ✅ Use backend value
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

  const handleSignOutClick = (): void => {
    setShowLogoutModal(true);
  };

  const handleConfirmSignOut = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await signOut();

      if (user) {
        localStorage.removeItem(`incognito_public_link_${user.uid}`);
      }

      navigate('/');
    } catch (error) {
      setError('Failed to sign out');
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ UPDATED: Mark single message as read (both state + backend)
  const handleMessageClick = async (message: Message): Promise<void> => {
    setSelectedMessage(message);
    setShowViewMessageModal(true);

    // Mark as read in state immediately for instant UI feedback
    if (!message.isRead) {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id ? { ...msg, isRead: true } : msg
        )
      );

      // ✅ Persist to backend
      try {
        await messageApi.markAsRead(message.id);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
        // Optionally revert state if backend call fails
      }
    }
  };

  // ✅ UPDATED: Mark all messages as read (both state + backend)
  const handleMarkAllAsRead = async (): Promise<void> => {
    // Update state immediately for instant UI feedback
    setMessages(prevMessages =>
      prevMessages.map(msg => ({ ...msg, isRead: true }))
    );

    // ✅ Persist to backend
    try {
      const response = await messageApi.markAllAsRead();
      if (!response.success) {
        setError('Failed to mark all messages as read');
      }
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
      setError('Failed to mark all messages as read');
    }
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
              <Button variant="outline" size="sm" onClick={handleSignOutClick}>
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
          <PublicLink />

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

        <MessageList
          messages={messages}
          onMessageClick={handleMessageClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          loading={false}
        />
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
        isLoading={isLoggingOut}
      />

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Inbox Link"
        description="Share this link to receive anonymous messages"
      >
        <PublicLink className="!p-0 !border-0 !bg-transparent" />
      </Modal>

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