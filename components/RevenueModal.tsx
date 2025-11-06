import React, { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyData: ChartDataPoint[];
  dailyTotal: number;
  monthlyData: ChartDataPoint[];
  monthlyTotal: number;
}

const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

type Tab = 'daily' | 'monthly';

const BarChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <div className="w-full h-64 flex justify-around items-end gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
          <div className="relative w-full flex-1 flex items-end justify-center">
             <div
              className="absolute bottom-0 w-[70%] bg-light-accent/50 dark:bg-dark-accent/50 rounded-t-md transition-all duration-300 group-hover:bg-light-accent dark:group-hover:bg-dark-accent"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 dark:bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                {formatCurrency(item.value)}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};


export const RevenueModal: React.FC<RevenueModalProps> = ({ isOpen, onClose, dailyData, dailyTotal, monthlyData, monthlyTotal }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<Tab>('daily');

  const TabButton: React.FC<{ tabId: Tab; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full ${
        activeTab === tabId
          ? 'bg-light-accent text-white dark:bg-dark-accent'
          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const currentData = activeTab === 'daily' ? dailyData : monthlyData;
  const currentTotal = activeTab === 'daily' ? dailyTotal : monthlyTotal;
  const currentTitle = activeTab === 'daily' ? 'Выручка за последние 7 дней' : 'Выручка за последние 12 месяцев';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Статистика по выручке</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <TabButton tabId="daily" label="Последние 7 дней" />
          <TabButton tabId="monthly" label="Последние 12 месяцев" />
        </div>

        <div className="bg-light-bg dark:bg-dark-glass p-4 sm:p-6 rounded-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentTitle}
            </p>
            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
              {formatCurrency(currentTotal)}
            </p>
          </div>
          <BarChart data={currentData} />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};