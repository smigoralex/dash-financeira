import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip = ({ content, children, position = 'top', delay = 300, className = '' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = triggerRect.top - tooltipRect.height - 8;
            left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
          case 'bottom':
            top = triggerRect.bottom + 8;
            left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
          case 'left':
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.left - tooltipRect.width - 8;
            break;
          case 'right':
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.right + 8;
            break;
        }

        // Garantir que o tooltip não saia da tela
        const padding = 8;
        if (top < padding) top = padding;
        if (left < padding) left = padding;
        if (top + tooltipRect.height > window.innerHeight - padding) {
          top = window.innerHeight - tooltipRect.height - padding;
        }
        if (left + tooltipRect.width > window.innerWidth - padding) {
          left = window.innerWidth - tooltipRect.width - padding;
        }

        setCoords({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-1.5 text-sm text-white dark:text-gray-100 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none animate-fadeIn transition-colors"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700'
                : position === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700'
                : 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700'
            }`}
          />
        </div>
      )}
    </>
  );
};

