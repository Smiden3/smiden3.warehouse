import React from 'react';
import type { Invoice } from '../types';
import type { Timestamp } from 'firebase/firestore';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;
  const formatDate = (timestamp: Timestamp) => timestamp.toDate().toLocaleString('ru-RU');

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-xl m-4 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Накладная #{invoice.id}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.createdAt)}</p>
            </div>
            <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="mt-6 max-h-[50vh] overflow-y-auto space-y-2 pr-2 border-t border-b py-4 border-gray-200 dark:border-gray-700">
            {invoice.items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-7">
                        <p className="font-semibold text-light-text dark:text-dark-text">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.id}</p>
                    </div>
                    <div className="col-span-2 text-center text-sm">{item.quantity} x {formatCurrency(item.price)}</div>
                    <div className="col-span-3 text-right font-semibold">{formatCurrency(item.quantity * item.price)}</div>
                </div>
            ))}
        </div>
        
        <div className="mt-6 flex justify-end">
            <div className="text-right">
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Итого:</p>
                <p className="text-3xl font-bold text-light-text dark:text-dark-text">{formatCurrency(invoice.total)}</p>
            </div>
        </div>

      </div>
    </div>
  );
};