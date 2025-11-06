import React from 'react';
import type { Product } from '../types';
import { EditIcon, TrashIcon } from '../constants';
import { CartControl } from './CartControl';

interface ProductListItemProps {
  product: Product;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onImageClick: (images: string[], startIndex: number) => void;
  cartQuantity: number;
  onCartChange: (newQuantity: number) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onImageClick,
  cartQuantity,
  onCartChange,
}) => {
  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

  return (
    <div className={`
      grid grid-cols-12 items-center p-2 rounded-xl transition-colors duration-200
      bg-light-card dark:bg-dark-glass
      ${isSelected ? 'bg-light-accent/10 dark:bg-dark-accent/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}
    `}>
      {/* Product Info */}
      <div className="col-span-12 md:col-span-5 flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="h-5 w-5 rounded border-gray-300 text-light-accent focus:ring-light-accent dark:bg-gray-700 dark:border-gray-600"
        />
        <button 
          onClick={() => onImageClick(product.photos, 0)} 
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-dark-accent rounded-lg flex-shrink-0"
        >
          <img src={product.photos[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
        </button>
        <div>
          <p className="font-semibold text-light-text dark:text-dark-text">{product.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{product.id}</p>
        </div>
      </div>
      
      {/* Category */}
      <div className="hidden md:block col-span-2 text-sm text-gray-600 dark:text-gray-400">{product.category}</div>
      
      {/* Stock, Price, Cart, Actions */}
      <div className="col-span-12 md:col-span-5 grid grid-cols-4 items-center gap-2 mt-2 md:mt-0">
        <div className="col-span-1 text-center font-medium">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.quantity < 5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
            {product.quantity}
          </span>
        </div>
        <div className="col-span-1 text-right font-semibold text-light-accent dark:text-dark-accent">{formatCurrency(product.price)}</div>
        <div className="col-span-2">
           <CartControl
            quantity={cartQuantity}
            onQuantityChange={onCartChange}
            stock={product.quantity}
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="hidden md:flex col-span-1 justify-end items-center space-x-2 pr-2">
        <button onClick={() => onEdit(product)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <EditIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <TrashIcon className="h-5 w-5 text-red-500" />
        </button>
      </div>

       {/* Actions for mobile */}
       <div className="md:hidden col-span-12 flex justify-end items-center gap-2 mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
            <button onClick={() => onEdit(product)} className="flex-1 text-sm py-2 rounded-lg bg-gray-200 dark:bg-gray-700">Редактировать</button>
            <button onClick={() => onDelete(product.id)} className="flex-1 text-sm py-2 rounded-lg bg-red-500/10 text-red-500">Удалить</button>
       </div>
    </div>
  );
};