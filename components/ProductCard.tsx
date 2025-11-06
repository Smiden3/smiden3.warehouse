import React from 'react';
import type { Product } from '../types';
import { EditIcon, TrashIcon } from '../constants';
import { CartControl } from './CartControl';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onImageClick: (images: string[], startIndex: number) => void;
  cartQuantity: number;
  onCartChange: (newQuantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onImageClick,
  cartQuantity,
  onCartChange,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  const handleImageContainerClick = () => {
    onImageClick(product.photos, currentImageIndex);
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

  return (
    <div className={`
      group relative rounded-xl overflow-hidden transition-all duration-300
      bg-light-card dark:bg-dark-glass dark:backdrop-blur-lg dark:border dark:border-dark-glass-border
      shadow-md hover:shadow-xl dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/30
      ${isSelected ? 'ring-2 ring-light-accent dark:ring-dark-accent' : ''}
    `}>
      <div className="absolute top-2 left-2 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="h-5 w-5 rounded border-gray-300 text-light-accent focus:ring-light-accent dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(product)} className="p-1.5 rounded-full bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 backdrop-blur-sm">
          <EditIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-1.5 rounded-full bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 backdrop-blur-sm">
          <TrashIcon className="h-4 w-4 text-red-500" />
        </button>
      </div>

      <div
        className="aspect-square relative w-full overflow-hidden cursor-pointer"
        onClick={handleImageContainerClick}
        onMouseLeave={() => {
          if (product.photos && product.photos.length > 1) {
            setCurrentImageIndex(0);
          }
        }}
      >
        <img 
            src={product.photos[currentImageIndex] || 'https://placehold.co/400x400/cccccc/FFFFFF/png?text=No+Image'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" 
        />
        
        {product.photos && product.photos.length > 1 && (
          <>
            <div 
              className="absolute top-0 left-0 h-full w-1/2 z-10"
              onMouseEnter={() => setCurrentImageIndex(0)}
            />
            <div 
              className="absolute top-0 right-0 h-full w-1/2 z-10"
              onMouseEnter={() => setCurrentImageIndex(1)}
            />
          </>
        )}

        {product.photos && product.photos.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center items-center gap-2">
                {product.photos.map((_, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
                        currentImageIndex === index ? 'bg-light-accent dark:bg-dark-accent scale-125' : 'bg-white/70 dark:bg-gray-400/80 backdrop-blur-sm'
                    }`}
                    aria-label={`Показать фото ${index + 1}`}
                />
                ))}
            </div>
        )}
      </div>

      <div className="p-2 sm:p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
        <h3 className="font-semibold truncate text-light-text dark:text-dark-text">{product.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">{`Арт: ${product.id}`}</p>
        <div className="flex justify-between items-center mt-1 sm:mt-2">
          <p className="text-lg font-bold text-light-accent dark:text-dark-accent">{formatCurrency(product.price)}</p>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.quantity < 5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
            {product.quantity} шт.
          </span>
        </div>
        <div className="mt-2 sm:mt-4">
          <CartControl
            quantity={cartQuantity}
            onQuantityChange={onCartChange}
            stock={product.quantity}
          />
        </div>
      </div>
    </div>
  );
};