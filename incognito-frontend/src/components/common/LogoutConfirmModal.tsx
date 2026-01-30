import React from 'react';
import { Button } from './Button';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-5 h-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-white text-center mb-1.5">
          Sign Out?
        </h3>
        <p className="text-xs text-gray-400 text-center mb-5">
          You'll need to sign in again to access your inbox.
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 text-xs"
          >
            Stay Signed In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-xs"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing out...
              </span>
            ) : (
              'Yes, Sign Out'
            )}
          </Button>
        </div>

        {/* Info Note */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-[10px] text-gray-500 text-center">
            Your messages and link remain safe
          </p>
        </div>
      </div>
    </div>
  );
};