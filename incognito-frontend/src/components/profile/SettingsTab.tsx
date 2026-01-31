import React from 'react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">
          Appearance
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          Choose how Incognito looks to you
        </p>

        <div className="space-y-2 sm:space-y-3">
          {/* Dark Mode (Primary) */}
          <button className="w-full bg-purple-500/10 border-2 border-purple-500 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left transition-all hover:bg-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-md sm:rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white">Dark Mode</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Current theme</p>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* Light Mode (Coming Soon) */}
          <button 
            disabled
            className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-md sm:rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white">Light Mode</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Coming soon</p>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
          <p className="text-[10px] sm:text-xs text-gray-500">
            More appearance settings coming soon
          </p>
        </div>
      </div>
    </div>
  );
};