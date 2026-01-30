import React, { useState, useMemo } from 'react';
import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  onMessageClick: (message: Message) => void;
  onMarkAllAsRead: () => void; // ✅ NEW PROP
  loading?: boolean;
}

type FilterType = 'all' | 'unread';

const MESSAGE_PREVIEW_LIMIT = 150;

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onMessageClick,
  onMarkAllAsRead, // ✅ NEW PROP
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');

  // Responsive items per page
  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 6 : 12;

  // Filter messages by read/unread status
  const filteredMessages = useMemo(() => {
    if (filter === 'unread') {
      return messages.filter(message => !message.isRead);
    }
    return messages;
  }, [messages, filter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const truncateMessage = (content: string, limit: number): { text: string; isTruncated: boolean } => {
    if (content.length <= limit) {
      return { text: content, isTruncated: false };
    }

    let truncateAt = limit;
    const lastSpace = content.lastIndexOf(' ', limit);
    if (lastSpace > limit * 0.8) {
      truncateAt = lastSpace;
    }

    return {
      text: content.substring(0, truncateAt).trim(),
      isTruncated: true,
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

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilterCount = (filterType: FilterType): number => {
    if (filterType === 'unread') {
      return messages.filter(message => !message.isRead).length;
    }
    return messages.length;
  };

  if (loading) {
    return (
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-16 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading messages...</p>
      </div>
    );
  }

  const unreadCount = getFilterCount('unread');
  const allCount = getFilterCount('all');

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d0d0d] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 font-medium">Filter by:</span>
          
          {/* All Messages */}
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] hover:text-gray-300'
            }`}
          >
            All ({allCount})
          </button>

          {/* Unread Messages */}
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-purple-500 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] hover:text-gray-300'
            }`}
          >
            {unreadCount > 0 && (
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            )}
            Unread ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ Mark All as Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark all as read
            </button>
          )}

          <div className="text-xs text-gray-500">
            Showing {filteredMessages.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredMessages.length)} of {filteredMessages.length}
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      {currentMessages.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {filter === 'all' ? 'No messages yet' : 'No unread messages'}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Share your link to start receiving anonymous messages'
              : 'All caught up! Check back later for new messages'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentMessages.map((message) => {
              const { text: previewText, isTruncated } = truncateMessage(message.content, MESSAGE_PREVIEW_LIMIT);
              const isUnread = !message.isRead;

              return (
                <div
                  key={message.id}
                  onClick={() => onMessageClick(message)}
                  className={`bg-[#0d0d0d] rounded-2xl p-5 hover:bg-[#111111] transition-all group cursor-pointer relative ${
                    isUnread 
                      ? 'border-2 border-white hover:border-purple-400' 
                      : 'border border-white/5 hover:border-purple-500/30'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {isUnread && (
                    <div className="absolute top-3 right-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received {formatDate(message.timestamp)}
                    </span>
                    {isUnread && (
                      <span className="ml-auto text-xs font-semibold text-blue-400 uppercase">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className={`border rounded-xl p-5 transition-colors ${
                    isUnread
                      ? 'bg-[#1a1a1a] border-white/10 group-hover:bg-[#1c1c1c] group-hover:border-purple-500/30'
                      : 'bg-[#1a1a1a] border-white/5 group-hover:bg-[#1c1c1c] group-hover:border-purple-500/20'
                  }`}>
                    <p className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                      {previewText}
                      {isTruncated && (
                        <span className="text-purple-400 font-medium ml-1">
                          ... See more
                        </span>
                      )}
                    </p>
                  </div>

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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#222] hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis =
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span key={page} className="px-2 text-gray-600">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-purple-500 text-white'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] hover:text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#222] hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};