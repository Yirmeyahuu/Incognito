import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { messageApi, linkApi } from '../services/api';
import type { Message } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [publicLink, setPublicLink] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's public link
  useEffect(() => {
    const fetchPublicLink = async () => {
      if (!user) return;

      try {
        const response = await linkApi.getMyLink();
        if (response.success && response.data) {
          setPublicLink(`${window.location.origin}/u/${response.data.publicId}`);
        } else {
          setError('Failed to load your public link');
        }
      } catch (err) {
        console.error('Error fetching public link:', err);
        setError('Failed to load your public link');
      }
    };

    fetchPublicLink();
  }, [user]);

  // Update the fetchMessages function (lines 47-81):
  
  // Fetch inbox messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
  
      setLoading(true);
      try {
        const response = await messageApi.getInbox();
        console.log('API Response:', JSON.stringify(response, null, 2)); // Better logging
        console.log('response.data type:', typeof response.data);
        console.log('response.data is array?', Array.isArray(response.data));
        console.log('response.data keys:', response.data ? Object.keys(response.data) : 'null');
        
        if (response.success && response.data) {
          let messagesData: any[] = [];
          
          // Check if data is directly an array
          if (Array.isArray(response.data)) {
            messagesData = response.data;
          } 
          // Check if data is an object with a messages property
          else if (typeof response.data === 'object') {
            // Try common property names
            if ('messages' in response.data) {
              messagesData = (response.data as any).messages;
            } else if ('data' in response.data) {
              messagesData = (response.data as any).data;
            } else {
              // Log the actual structure
              console.error('Unexpected data structure. Keys:', Object.keys(response.data));
              console.error('Full data object:', response.data);
            }
          }
          
          console.log('Final messagesData:', messagesData);
          
          // Convert backend messages to frontend format
          if (Array.isArray(messagesData) && messagesData.length > 0) {
            const formattedMessages: Message[] = messagesData.map((msg) => ({
              id: msg.id,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              isRead: msg.isRead,
              isArchived: false,
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([]);
          }
          
          setError(''); // Clear any errors
        } else {
          console.error('API Error:', response);
          setError(response.error || 'Failed to load messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, [user]);

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.isRead;
    if (filter === 'archived') return msg.isArchived;
    return !msg.isArchived;
  });

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await messageApi.markAsRead(id);
      if (response.success) {
        setMessages(prev =>
          prev.map(msg => (msg.id === id ? { ...msg, isRead: true } : msg))
        );
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleArchive = (id: string) => {
    // Archive functionality - local only for now (backend doesn't support it yet)
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, isArchived: !msg.isArchived } : msg))
    );
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    try {
      const response = await messageApi.deleteMessage(selectedMessage.id);
      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
        setShowDeleteModal(false);
        setSelectedMessage(null);
      } else {
        setError(response.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRegenerateLink = async () => {
    try {
      const response = await linkApi.regenerateLink();
      if (response.success && response.data) {
        setPublicLink(`${window.location.origin}/u/${response.data.publicId}`);
      } else {
        setError(response.error || 'Failed to regenerate link');
      }
    } catch (err) {
      console.error('Error regenerating link:', err);
      setError('Failed to regenerate link');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const formatDate = (date: Date) => {
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
      <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#131313]/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Logo variant="dark" size="sm" showText={false} />
              <div>
                <h1 className="text-base sm:text-lg font-bold">Dashboard</h1>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Welcome back, {user?.displayName || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
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
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Public Link Card */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Your Public Link</h3>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xs sm:text-sm bg-[#131313] px-3 py-2 rounded border border-white/10 truncate">
                {publicLink || 'Loading...'}
              </code>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1"
                disabled={!publicLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateLink}
                disabled={!publicLink}
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Inbox Stats</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold">{messages.filter(m => !m.isArchived).length}</span>
              <span className="text-gray-400">messages</span>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs sm:text-sm text-purple-400 mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-[#131313]'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            All Messages ({messages.filter(m => !m.isArchived).length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-white text-[#131313]'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'archived'
                ? 'bg-white text-[#131313]'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            Archived ({messages.filter(m => m.isArchived).length})
          </button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400">No messages {filter !== 'all' && `in ${filter}`}</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-[#1a1a1a] border rounded-xl p-4 sm:p-5 hover:border-white/20 transition-all ${
                  !message.isRead ? 'border-purple-500/30' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {!message.isRead && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                    <span className="text-xs sm:text-sm text-gray-400">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!message.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(message.id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title={message.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  {message.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Share Link Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Inbox Link"
        description="Share this link to receive anonymous messages"
      >
        <div className="space-y-4">
          <div className="bg-[#131313] border border-white/10 rounded-lg p-4">
            <code className="text-sm text-purple-400 break-all">{publicLink}</code>
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
    </div>
  );
};