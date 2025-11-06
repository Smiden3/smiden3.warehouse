import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-xl overflow-hidden bg-light-card dark:bg-dark-glass dark:border dark:border-dark-glass-border shadow-md">
      <div className="animate-pulse">
        <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};
