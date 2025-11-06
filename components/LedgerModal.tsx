import React, { useState, useMemo } from 'react';
import type { LedgerEntry } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: LedgerEntry[];
}

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const LedgerModal: React.FC<LedgerModalProps> = ({ isOpen, onClose, ledger }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const entriesForSelectedDate = useMemo(() => {
    return ledger
      .filter(entry => isSameDay(new Date(entry.timestamp), selectedDate))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [ledger, selectedDate]);

  const goToPreviousDay = () => setSelectedDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(prev.getDate() - 1);
    return newDate;
  });
  const goToToday = () => setSelectedDate(new Date());
  const goToNextDay = () => setSelectedDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(prev.getDate() + 1);
    return newDate;
  });
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };
  
  const getTypeBadge = (type: LedgerEntry['type']) => {
    switch(type) {
      case 'receipt':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Приход</span>;
      case 'invoice':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Расход</span>;
      case 'edit':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">Правка</span>;
      case 'delete':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Удаление</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Журнал операций</h2>
          <button onClick={onClose} className="text-2xl font-bold -mt-2">&times;</button>
        </div>

        {/* Date Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-4 rounded-lg bg-light-bg dark:bg-dark-glass">
            <div className="flex items-center gap-2">
                <button onClick={goToPreviousDay} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Предыдущий день"><ChevronLeftIcon className="h-5 w-5"/></button>
                <span className="font-semibold w-40 text-center">{selectedDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <button onClick={goToNextDay} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Следующий день"><ChevronRightIcon className="h-5 w-5"/></button>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={goToToday} className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Сегодня</button>
                 <input 
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    onChange={handleDateChange}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                    aria-label="Выбрать дату"
                 />
            </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase pb-2 border-b dark:border-gray-700 sticky top-0 bg-light-card dark:bg-dark-bg">
                <div className="col-span-1">Время</div>
                <div className="col-span-4">Товар</div>
                <div className="col-span-2">Операция</div>
                <div className="col-span-2 text-center">Изменение</div>
                <div className="col-span-3 text-center">Остаток</div>
            </div>
          {entriesForSelectedDate.length > 0 ? (
            entriesForSelectedDate.map(entry => (
              <div key={entry.timestamp + entry.productId} className="grid grid-cols-12 items-center gap-4 p-3 rounded-lg bg-light-bg dark:bg-dark-glass text-sm">
                <div className="col-span-12 md:col-span-1 text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="col-span-12 md:col-span-4">
                  <p className="font-semibold text-light-text dark:text-dark-text truncate">{entry.productName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{`Арт: ${entry.productId}`}</p>
                </div>
                <div className="col-span-6 md:col-span-2">{getTypeBadge(entry.type)}</div>
                <div className={`col-span-6 md:col-span-2 text-center font-bold ${entry.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                </div>
                <div className="col-span-12 md:col-span-3 text-center text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">{entry.beforeQuantity}</span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold">{entry.afterQuantity}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">
              <p>Нет операций за этот день.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
