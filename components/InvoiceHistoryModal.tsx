import React from 'react';
import type { Invoice } from '../types';
import type { Timestamp } from 'firebase/firestore';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({ isOpen, onClose, invoices, onViewInvoice }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;
  const formatDate = (timestamp: Timestamp) => timestamp.toDate().toLocaleString('ru-RU');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">История накладных</h2>
        
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
          {invoices.length > 0 ? (
            invoices.map(invoice => (
              <button 
                key={invoice.id} 
                onClick={() => onViewInvoice(invoice)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-light-bg dark:bg-dark-glass hover:ring-2 hover:ring-light-accent dark:hover:ring-dark-accent transition-all duration-200 text-left"
              >
                <div>
                  <p className="font-semibold text-light-text dark:text-dark-text">Накладная #{invoice.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.createdAt)}</p>
                </div>
                <div className="font-bold text-light-accent dark:text-dark-accent">
                  {formatCurrency(invoice.total)}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">История накладных пуста.</p>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};