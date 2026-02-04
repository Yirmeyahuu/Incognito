import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Logo } from '../components/common/Logo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔑 Attempting email/password login...');
      await signIn(email, password);
      console.log('✅ Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 Attempting Google sign in...');
      await signInWithGoogle();
      console.log('✅ Google sign in successful, navigating to dashboard...');
      
      // ✅ Ensure navigation happens after auth is complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 200);
    } catch (err: any) {
      console.error('❌ Google sign in failed:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Go Back Home Button - Top Left */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-10"
      >
        <svg 
          className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-4 sm:mb-6">
          <Link to="/" className="inline-block">
            <Logo variant="dark" size="lg" className="justify-center" />
          </Link>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Welcome back! Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111111] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs sm:text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email Input */}
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            {/* Password Input */}
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-[#111111] text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 sm:gap-3"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xs sm:text-sm">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </Button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-4 text-xs sm:text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};