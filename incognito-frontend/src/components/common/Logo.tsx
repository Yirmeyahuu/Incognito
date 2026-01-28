import React from 'react';
import logoWhite from '../../assets/incognitoLogo(White).webp';
import logoBlack from '../../assets/incognitoLogo(Black).webp';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md',
  className = '',
  showText = true 
}) => {
  const logoSrc = variant === 'dark' ? logoWhite : logoBlack;
  
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-11',
    xl: 'h-12 sm:h-16'
  };

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <img 
        src={logoSrc} 
        alt="Incognito Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
};