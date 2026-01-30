import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { messageApi, linkApi } from '../services/api';
import incognitoLogo from '../assets/incognitoLogo(White).webp';

export const SendMessage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const MAX_CHARACTERS = 1000;

  // Validate the public link when component mounts
  useEffect(() => {
    const validateLink = async (): Promise<void> => {
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
        setError('Failed to validate link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };

    validateLink();
  }, [publicId]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.trim().length < 3) {
      setError('Message must be at least 3 characters long');
      return;
    }

    if (message.trim().length > MAX_CHARACTERS) {
      setError(`Message must be less than ${MAX_CHARACTERS} characters`);
      return;
    }

    if (!publicId) {
      setError('Invalid link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await messageApi.sendMessage(publicId, message.trim());
      
      if (response.success) {
        setMessage('');
        setShowSuccessModal(true);
      } else {
        setError(response.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_CHARACTERS) {
      setMessage(newMessage);
      setError('');
    }
  };

  const handleSendAnother = (): void => {
    setShowSuccessModal(false);
    setMessage('');
  };

  const handleGoHome = (): void => {
    navigate('/');
  };

  // Loading state while validating link
  if (isValidating) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Validating link...</p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <Logo variant="dark" size="sm" />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-lg">
          <div className="bg-[#0a0a0a] border border-red-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white">Invalid Link</h1>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
              {error || 'This link is no longer active or does not exist.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-black font-medium text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Valid link - show message form
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-green-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3 text-white">
              Message Sent Successfully!
            </h2>

            {/* Message */}
            <p className="text-sm sm:text-base text-gray-400 text-center mb-6 sm:mb-8 leading-relaxed">
              Your message has been sent anonymously. The recipient will never know your identity.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSendAnother}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Another Message
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 sm:py-3.5 px-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200"
              >
                Go to Home
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-600 text-center mt-4 sm:mt-6">
              🔒 Your identity remains completely anonymous
            </p>
          </div>
        </div>
      )}

      {/* ✅ Error Notification - Top Right */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 sm:px-0">
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-xs sm:text-sm break-words">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400/50 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <Logo variant="dark" size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-2xl">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
              <img 
                src={incognitoLogo} 
                alt="Incognito" 
                className="w-full h-full object-contain opacity-90"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Send Anonymous Message
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base">
              Your identity will remain completely anonymous
            </p>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Textarea */}
            <div>
              <textarea
                id="message"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type your anonymous message here..."
                rows={8}
                maxLength={MAX_CHARACTERS}
                className="w-full bg-black border border-white/10 rounded-lg sm:rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2 sm:mt-3 px-1">
                <p className="text-xs text-gray-500">
                  {message.length}/{MAX_CHARACTERS} characters
                </p>
                <p className="text-xs text-gray-500">
                  Min. 3 characters
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-black/50 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide">Guidelines</p>
              <ul className="text-xs sm:text-sm text-gray-500 space-y-1.5 sm:space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Be respectful and kind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>No hate speech or harassment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Your identity remains completely anonymous</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !message.trim() || message.trim().length < 3}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Anonymous Message'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              🔒 Messages are encrypted and sent anonymously
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};