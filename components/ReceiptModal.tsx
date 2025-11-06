import React, { useState, useMemo } from 'react';
import type { Product } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCreateReceipt: (items: { productId: string, quantity: number }[]) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, products, onCreateReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Record<string, number>>({});

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const itemsToReceive = useMemo(() => {
    return Object.entries(items)
      .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }))
      .filter(item => item.quantity > 0);
  }, [items]);

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    setItems(prev => ({
      ...prev,
      [productId]: isNaN(quantity) || quantity < 0 ? 0 : quantity
    }));
  };

  const handleSubmit = () => {
    onCreateReceipt(itemsToReceive);
    setItems({});
    setSearchTerm('');
  };

  const handleClose = () => {
    setItems({});
    setSearchTerm('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Поступление товара</h2>
          <button onClick={handleClose} className="text-2xl font-bold -mt-2">&times;</button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Поиск товара по названию или артикулу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="grid grid-cols-12 items-center gap-4 p-2 rounded-lg bg-light-bg dark:bg-dark-glass">
                <div className="col-span-1">
                  <img src={product.photos[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                </div>
                <div className="col-span-6">
                  <p className="font-semibold text-light-text dark:text-dark-text truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{`Арт: ${product.id}`}</p>
                </div>
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">На складе:</span> {product.quantity} шт.
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="Кол-во"
                      value={items[product.id] || ''}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">шт.</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">Товары не найдены.</p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={itemsToReceive.length === 0}
            className="px-6 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Оприходовать ({itemsToReceive.reduce((sum, item) => sum + item.quantity, 0)} шт.)
          </button>
        </div>
      </div>
    </div>
  );
};