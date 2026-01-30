import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import logoWhite from '../../assets/incognitoLogo(White).webp';

interface ShareCardGeneratorProps {
  publicLink: string;
  username: string;
  onClose: () => void;
}

export const ShareCardGenerator: React.FC<ShareCardGeneratorProps> = ({
  publicLink,
  username,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | null>(null);

  // Generate QR code when component mounts - ✅ WHITE QR CODE
  React.useEffect(() => {
    QRCode.toDataURL(publicLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#ffffff', // ✅ White color (was purple)
        light: '#0a0a0a', // Dark background
      },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [publicLink]);

  const handleDownloadCard = async (platform: 'instagram' | 'facebook') => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    setSelectedPlatform(platform);

    try {
      // Wait a bit for the card to render with selected platform
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `incognito-${platform}-story.png`;
      link.href = dataUrl;
      link.click();

      // Reset after download
      setTimeout(() => {
        setSelectedPlatform(null);
        setIsGenerating(false);
      }, 500);
    } catch (error) {
      console.error('Error generating share card:', error);
      setIsGenerating(false);
      setSelectedPlatform(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Share to Social Media</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform Selection */}
        <p className="text-sm text-gray-400 mb-4">
          Choose a platform to download your share card:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Instagram Button */}
          <button
            onClick={() => handleDownloadCard('instagram')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Instagram Story</span>
          </button>

          {/* Facebook Button */}
          <button
            onClick={() => handleDownloadCard('facebook')}
            disabled={isGenerating}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Facebook Story</span>
          </button>
        </div>

        {/* Preview Card (Hidden, used for generation) */}
        <div className="hidden">
          <div
            ref={cardRef}
            className="relative w-[1080px] h-[1920px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }}
          >
            {/* Blur overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                backdropFilter: 'blur(40px)',
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-20">
              {/* Logo Image - ✅ REDUCED SIZE */}
              <div className="mb-16 flex flex-col items-center">
                <img 
                  src={logoWhite} 
                  alt="Incognito Logo" 
                  className="w-[300px] h-auto mb-6"
                  style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
                />
                <div className="text-3xl text-purple-200 text-center font-medium">
                  Send Anonymous Messages
                </div>
              </div>

              {/* Card */}
              <div className="bg-black/40 backdrop-blur-xl border-4 border-white/20 rounded-[40px] p-16 max-w-[800px] w-full">
                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="bg-[#0a0a0a] p-8 rounded-3xl mb-12 flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                  </div>
                )}

                {/* Link - ✅ WHITE TEXT */}
                <div className="bg-[#0a0a0a] border-2 border-white/20 rounded-2xl p-10 mb-12">
                  <p className="text-3xl text-white font-mono text-center break-all leading-relaxed">
                    {publicLink}
                  </p>
                </div>

                {/* CTA - ✅ GRADIENT TEXT */}
                <div className="text-center">
                  <p 
                    className="text-5xl font-bold mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f472b6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Send me a message!
                  </p>
                  <p className="text-2xl text-gray-300">
                    Scan the QR code or visit the link
                  </p>
                </div>
              </div>

              {/* Username */}
              <div className="mt-16 text-center">
                <p className="text-3xl text-white/80 font-semibold">
                  @{username}
                </p>
              </div>

              {/* Platform Badge */}
              {selectedPlatform && (
                <div className="absolute bottom-20 right-20 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-full">
                  <p className="text-2xl font-bold text-white">
                    {selectedPlatform === 'instagram' ? '📸 Instagram Story' : '📘 Facebook Story'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 text-center">
            💡 <span className="font-semibold text-purple-400">Tip:</span> After downloading, 
            upload the image to your {selectedPlatform || 'chosen platform'}'s story!
          </p>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-4 flex items-center justify-center gap-2 text-purple-400">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Generating your share card...</span>
          </div>
        )}
      </div>
    </div>
  );
};