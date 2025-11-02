import { useState, useEffect } from 'react';
import { HiWifi } from 'react-icons/hi';

interface LiveIndicatorProps {
  isLive?: boolean;
  className?: string;
}

export const LiveIndicator = ({ isLive = true, className = '' }: LiveIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLive) {
      setIsVisible(true);
      // Pulsar a cada 2 segundos
      const interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 100);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  if (!isLive) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full bg-green-500 ${
          isVisible ? 'animate-pulse' : ''
        }`}
      ></span>
      <span className="hidden sm:inline">Ao vivo</span>
      <HiWifi className="w-3 h-3" />
    </div>
  );
};
