import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo variant="dark" size="md" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="whitespace-nowrap"
            >
              Log In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/signup')}
              className="whitespace-nowrap"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};