
import React from 'react';

interface AvatarProps {
  name: string;
  color: string;
  seed: number;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ name, color, seed, size = 'md' }) => {
  const initials = name.substring(0, 2).toUpperCase();
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-sm';
  
  return (
    <div 
      className={`${dim} rounded-xl flex items-center justify-center font-black relative overflow-hidden shadow-inner group`}
      style={{ backgroundColor: color }}
    >
      {/* Procedural Pattern Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay" viewBox="0 0 100 100">
        {seed % 3 === 0 ? (
          <circle cx="50" cy="50" r="40" fill="white" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        ) : seed % 3 === 1 ? (
          <rect x="10" y="10" width="80" height="80" fill="transparent" stroke="white" strokeWidth="2" strokeDasharray="10,2" />
        ) : (
          <path d="M10,10 L90,90 M90,10 L10,90" stroke="white" strokeWidth="4" />
        )}
      </svg>
      <span className="relative z-10 text-white drop-shadow-md">{initials}</span>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
    </div>
  );
};

export default Avatar;
