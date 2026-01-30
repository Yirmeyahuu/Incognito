import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Modal } from './Modal';
import { Button } from './Button';
import incognitoLogo from '../../assets/incognitoLogo(White).webp';

interface ViewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    content: string;
    timestamp: Date;
  } | null;
}

export const ViewMessageModal: React.FC<ViewMessageModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!message) return null;

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? 'Just now' : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportImage = async (): Promise<void> => {
    if (!exportRef.current) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        width: 1080,
        height: 1920,
        windowWidth: 1080,
        windowHeight: 1920,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `incognito-message-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const messageLength = message.content.length;
  const isLongMessage = messageLength > 300;

  // Determine size classes
  const textSizeClass = 
    messageLength < 50 ? 'story-text-xl' :
    messageLength < 150 ? 'story-text-lg' :
    messageLength < 300 ? 'story-text-md' :
    messageLength < 500 ? 'story-text-sm' : 'story-text-xs';

  const boxPaddingClass =
    messageLength < 150 ? 'story-message-box-short' :
    messageLength < 500 ? 'story-message-box-medium' : 'story-message-box-long';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anonymous Message"
      description={`Received ${formatDate(message.timestamp)}`}
    >
      <div className="space-y-6">
        {/* Hidden Export Template */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={exportRef} className="story-canvas">
            {/* Top Section: Logo + Title */}
            <div className="story-section-top">
              <div className="story-logo">
                <img 
                  src={incognitoLogo} 
                  alt="Incognito" 
                  className={isLongMessage ? 'story-logo-long' : 'story-logo-normal'}
                  crossOrigin="anonymous"
                />
              </div>

              <h2 className={`story-title ${isLongMessage ? 'story-title-long' : 'story-title-normal'}`}>
                Anonymous Message
              </h2>
            </div>

            {/* Middle Section: Message Content */}
            <div className="story-section-middle">
              <div className={`story-message-box ${boxPaddingClass}`}>
                <p className={`story-message-text ${textSizeClass}`}>
                  {message.content}
                </p>
              </div>
            </div>

            {/* Bottom Section: Footer */}
            <div className="story-section-bottom">
              <div className={`story-badge ${isLongMessage ? 'story-badge-long' : 'story-badge-normal'}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>100% Anonymous</span>
              </div>

              {/* ✅ Timestamp removed */}

              <p className={`story-website ${isLongMessage ? 'story-website-long' : 'story-website-normal'}`}>
                incognito.cosedevs.com
              </p>
            </div>
          </div>
        </div>

        {/* Message Content (Modal View) */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
          <p className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Message Stats */}
        <div className="flex items-center justify-between px-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>100% Anonymous</span>
          </div>
          <span>{message.content.length} characters</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleExportImage}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2 sm:py-2.5"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm">Save as Story</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1 text-sm py-2 sm:py-2.5"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};