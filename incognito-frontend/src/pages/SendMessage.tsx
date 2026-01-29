import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { messageApi, linkApi } from '../services/api';
import { sanitizeMessage } from '../utils/security';

export const SendMessage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validate the public link when component mounts
  useEffect(() => {
    const validateLink = async () => {
      if (!publicId) {
        setError('Invalid link');
        setIsValidating(false);
        return;
      }

      try {
        const response = await linkApi.validateLink(publicId);
        
        if (response.success && response.data?.isValid) {
          setIsValidLink(true);
        } else {
          setError('This link is no longer active or does not exist.');
        }
      } catch (err) {
        console.error('Error validating link:', err);
        setError('Failed to validate link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };

    validateLink();
  }, [publicId]);

    // Update the handleSubmit function around line 60:

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
        setError('Please enter a message');
        return;
    }

    if (message.trim().length < 3) {
        setError('Message must be at least 3 characters long');
        return;
    }

    if (message.trim().length > 500) {
        setError('Message must be less than 500 characters');
        return;
    }

    if (!publicId) {
        setError('Invalid link');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        console.log('Sending message to publicId:', publicId);
        console.log('Message content:', message.trim());
        
        const response = await messageApi.sendMessage(publicId, message.trim());
        
        console.log('Send message response:', response);
        
        if (response.success) {
        setSuccess(true);
        setMessage('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
            setSuccess(false);
        }, 5000);
        } else {
        console.error('Send failed:', response.error);
        setError(response.error || 'Failed to send message. Please try again.');
        }
    } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
    } finally {
        setIsLoading(false);
    }
    };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= 500) {
      setMessage(newMessage);
      setError('');
    }
  };

  // Loading state while validating link
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Validating link...</p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-[#131313] text-white">
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <Logo variant="dark" size="sm" />
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Invalid Link</h1>
            <p className="text-gray-400 mb-6">{error || 'This link is no longer active or does not exist.'}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Valid link - show message form
  return (
    <div className="min-h-screen bg-[#131313] text-white">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Logo variant="dark" size="sm" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Send Anonymous Message</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Your identity will remain completely anonymous
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium text-sm sm:text-base">Message sent successfully!</p>
                  <p className="text-green-400/70 text-xs sm:text-sm mt-1">You can send another message or close this page.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                Your Anonymous Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type your message here... Be kind and respectful!"
                rows={6}
                maxLength={500}
                className="w-full bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all text-sm sm:text-base"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {message.length}/500 characters
                </p>
                <p className="text-xs text-gray-500">
                  Min. 3 characters
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-[#131313] border border-white/5 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">📋 Guidelines:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Be respectful and kind</li>
                <li>• No hate speech or harassment</li>
                <li>• Your identity is completely anonymous</li>
                <li>• Messages are permanently stored</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isLoading || !message.trim() || message.trim().length < 3}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Anonymous Message'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 text-center">
              🔒 This message is sent securely and anonymously. The recipient will not know your identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};