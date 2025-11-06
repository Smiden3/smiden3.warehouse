import React from 'react';
import type { Product } from '../types';

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} ₽`;
}

export const LowStockModal: React.FC<LowStockModalProps> = ({ isOpen, onClose, products }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Товары с низким запасом</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          У следующих товаров количество на складе меньше 5.
        </p>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-light-bg dark:bg-dark-glass">
                <div className="flex items-center space-x-4">
                  <img src={product.photos[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                  <div>
                    <p className="font-semibold text-light-text dark:text-dark-text">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.id}</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-light-warning/20 text-light-warning dark:bg-dark-warning/20 dark:text-dark-warning`}>
                        {product.quantity} шт.
                    </span>
                    <p className="text-sm font-semibold text-light-accent dark:text-dark-accent mt-1">{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Нет товаров с низким запасом.</p>
          )}
        </div>
        <div className="flex justify-end pt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};