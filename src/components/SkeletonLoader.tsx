interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'chart';
  count?: number;
}

export const SkeletonLoader = ({ type = 'card', count = 1 }: SkeletonLoaderProps) => {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 animate-pulse transition-colors"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 bg-gray-200 rounded flex-1"></div>
              <div className="h-12 bg-gray-200 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return null;
};

