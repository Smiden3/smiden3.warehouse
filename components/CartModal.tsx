import React, { useMemo } from 'react';
import type { CartItem, Product } from '../types';
import { MinusIcon, PlusIcon, SaveArrowIcon, TrashIcon } from '../constants';
import { ToggleSwitch } from './ToggleSwitch';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
  onCreateInvoice: () => void;
  shouldDownloadPdf: boolean;
  onDownloadToggle: (checked: boolean) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemove,
  onCreateInvoice,
  shouldDownloadPdf,
  onDownloadToggle,
}) => {
  const cartWithDetails = useMemo(() => {
    return cart
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cart, products]);

  const total = useMemo(() => {
    return cartWithDetails.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartWithDetails]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Корзина</h2>
          <button onClick={onClose} className="text-2xl font-bold -mt-2">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 max-h-[60vh]">
          {cartWithDetails.length > 0 ? (
            cartWithDetails.map(({ productId, quantity, product }) => (
              <div key={productId} className="flex items-center gap-4 p-2 rounded-lg bg-light-bg dark:bg-dark-glass">
                <img src={product.photos[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold text-light-text dark:text-dark-text">{product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(product.price)}</p>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full h-9 p-0.5">
                    <button
                        onClick={() => onUpdateQuantity(productId, quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label={quantity === 1 ? "Удалить товар" : "Уменьшить количество"}
                    >
                        {quantity === 1 ? <TrashIcon className="h-5 w-5 text-red-500" /> : <MinusIcon className="h-5 w-5" />}
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            onUpdateQuantity(productId, isNaN(value) ? 0 : value);
                        }}
                        className="font-bold w-10 text-center bg-transparent focus:outline-none text-light-text dark:text-dark-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Количество товара"
                        min="0"
                    />
                    <button
                        onClick={() => onUpdateQuantity(productId, quantity + 1)}
                        disabled={quantity >= product.quantity}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        aria-label="Увеличить количество"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="font-semibold text-right w-24">{formatCurrency(product.price * quantity)}</div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">Ваша корзина пуста.</p>
          )}
        </div>

        {cartWithDetails.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Итого:</p>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text">{formatCurrency(total)}</p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <label htmlFor="download-pdf" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Скачать PDF накладной
              </label>
              <ToggleSwitch
                checked={shouldDownloadPdf}
                onChange={onDownloadToggle}
              />
            </div>
            <button
              onClick={onCreateInvoice}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <SaveArrowIcon className="h-5 w-5" />
              <span>Создать накладную</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};