import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/common/Navbar';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content - Add padding-top to account for fixed navbar */}
      <div className="pt-14 sm:pt-16">
        {/* Hero Section - Mobile First */}
        <section className="pt-16 sm:pt-20 md:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="space-y-3 sm:space-y-5 mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-1">
                Receive Anonymous
                <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Messages Safely
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto px-2 sm:px-4">
                Get honest feedback, confessions, or suggestions through your own private inbox. 
                Share your link and let people speak freely.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center items-stretch sm:items-center mb-8 sm:mb-14 px-2 sm:px-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto"
              >
                Create Your Inbox
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Log In
              </Button>
            </div>

            {/* Demo Preview - Compact Mobile */}
            <div className="relative px-1 sm:px-2">
              <div className="bg-[#111111] border border-white/5 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-8 shadow-2xl">
                <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-[#0a0a0a] rounded-md sm:rounded-lg p-3 sm:p-5 text-left">
                  <p className="text-gray-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2">Your public link:</p>
                  <p className="text-purple-400 font-mono text-[11px] sm:text-xs md:text-sm break-all">
                    incognito.cosedevs.com/u/your-unique-id
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Compact Grid */}
        <section className="py-10 sm:py-14 px-3 sm:px-4 bg-[#111111]/30">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-10 px-2">
              Why Use Incognito?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {/* Feature 1 */}
              <div className="bg-[#111111] border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-white/10 transition-all">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">100% Anonymous</h4>
                <p className="text-xs sm:text-sm text-gray-400">Messages are completely anonymous. No tracking, no data collection.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#111111] border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-white/10 transition-all">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Instant Setup</h4>
                <p className="text-xs sm:text-sm text-gray-400">Get your unique link in seconds. No complex configuration needed.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#111111] border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-white/10 transition-all sm:col-span-2 lg:col-span-1">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-pink-500/10 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Full Control</h4>
                <p className="text-xs sm:text-sm text-gray-400">Enable or disable your inbox anytime. Delete or archive messages.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-10 sm:py-14 px-3 sm:px-4">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-10 px-2">
              Perfect For
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">💬 Personal Confessions</h4>
                <p className="text-xs sm:text-sm text-gray-400">Let friends share honest thoughts and feelings anonymously.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">📊 Anonymous Feedback</h4>
                <p className="text-xs sm:text-sm text-gray-400">Collect genuine feedback from customers or team members.</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">🗳️ Elections & Voting</h4>
                <p className="text-xs sm:text-sm text-gray-400">Gather candidate suggestions and anonymous opinions.</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">💡 Ideas & Suggestions</h4>
                <p className="text-xs sm:text-sm text-gray-400">Receive creative ideas without judgment or bias.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-5 sm:py-7 px-3 sm:px-4 border-t border-white/5">
          <div className="container mx-auto text-center text-gray-400/80 text-[10px] sm:text-xs">
            <p>&copy; 2026 Incognito. All rights reserved.</p>
            <p className="mt-1">
              Developed by{' '}
              <span className="text-gray-200/90 font-medium">jeremiahpantaras</span>
              {' '}—{' '}
              <span className="text-gray-200/90 font-medium">COSDevs</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};