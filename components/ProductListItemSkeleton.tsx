import React from 'react';

export const ProductListItemSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-12 items-center p-2 rounded-xl bg-light-card dark:bg-dark-glass">
      <div className="animate-pulse col-span-12 md:col-span-5 flex items-center space-x-3">
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
      
      <div className="hidden md:block col-span-2">
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
      </div>
      
      <div className="col-span-12 md:col-span-5 grid grid-cols-4 items-center gap-2 mt-2 md:mt-0 animate-pulse">
        <div className="col-span-1 flex justify-center">
            <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="col-span-1 flex justify-end">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="col-span-2">
           <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
      
      <div className="hidden md:flex col-span-1 justify-end items-center space-x-2 pr-2 animate-pulse">
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  );
};
