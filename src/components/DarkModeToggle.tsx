import { HiMoon, HiSun } from 'react-icons/hi';
import { useDarkMode } from '../hooks/useDarkMode';
import { Tooltip } from './Tooltip';

export const DarkModeToggle = () => {
  const { isDark, toggle } = useDarkMode();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <Tooltip content={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'} position="bottom">
      <button
        onClick={handleToggle}
        className="p-2 sm:p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        type="button"
      >
        {isDark ? (
          <HiSun className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <HiMoon className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>
    </Tooltip>
  );
};

