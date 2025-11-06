import React from 'react';

interface DashboardWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  colorClass: string;
  onClick?: () => void;
  blurValue?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ icon, title, value, colorClass, onClick, blurValue }) => {
  const commonClasses = `
    p-4 rounded-xl transition-all duration-300
    bg-light-card dark:bg-dark-glass dark:backdrop-blur-lg dark:border dark:border-dark-glass-border
    shadow-md dark:shadow-lg dark:shadow-black/20
    flex items-center space-x-4 text-left
  `;
  
  const content = (
    <>
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold text-light-text dark:text-dark-text ${blurValue ? 'blur-sm' : ''}`}>{value}</p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`${commonClasses} w-full hover:ring-2 hover:ring-light-accent dark:hover:ring-dark-accent`}>
        {content}
      </button>
    );
  }

  return (
    <div className={commonClasses}>
      {content}
    </div>
  );
};