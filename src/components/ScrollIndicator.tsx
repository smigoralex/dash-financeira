import { useState, useEffect } from 'react';
import { HiChevronRight } from 'react-icons/hi';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export const ScrollIndicator = ({ containerRef, className = '' }: ScrollIndicatorProps) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        // Mostrar indicador se houver mais conteúdo à direita
        setShowIndicator(scrollLeft + clientWidth < scrollWidth - 10); // -10 para margem de erro
      } else {
        setShowIndicator(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      // Verificar inicialmente
      checkScroll();
      
      // Listeners
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      // Verificar periodicamente (caso o conteúdo seja carregado dinamicamente)
      const interval = setInterval(checkScroll, 500);

      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearInterval(interval);
      };
    }
  }, [containerRef]);

  if (!showIndicator) return null;

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    >
      <div className="animate-bounce-slow">
        <HiChevronRight className="w-6 h-6 text-blue-500" />
      </div>
    </div>
  );
};

