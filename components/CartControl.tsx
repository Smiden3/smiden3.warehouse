import React from 'react';
import { PlusIcon, MinusIcon, TrashIcon, CartIcon } from '../constants';

interface CartControlProps {
    quantity: number;
    onQuantityChange: (newQuantity: number) => void;
    stock: number;
}

export const CartControl: React.FC<CartControlProps> = ({ quantity, onQuantityChange, stock }) => {
    if (quantity === 0) {
        return (
            <button 
                onClick={() => onQuantityChange(1)}
                disabled={stock === 0}
                className="w-full h-10 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-light-accent/90 dark:bg-dark-accent/90 text-white font-semibold hover:bg-light-accent dark:hover:bg-dark-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CartIcon className="h-5 w-5" />
                <span>Добавить</span>
            </button>
        );
    }
    
    return (
        <div className="flex items-center justify-between rounded-lg bg-gray-200 dark:bg-gray-700 h-10">
            <button 
                onClick={() => onQuantityChange(quantity - 1)}
                className="p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors h-full"
            >
                {quantity === 1 ? <TrashIcon className="h-5 w-5 text-red-500"/> : <MinusIcon className="h-5 w-5" />}
            </button>
            <span className="font-bold w-12 text-center text-light-text dark:text-dark-text">{quantity}</span>
            <button 
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={quantity >= stock}
                className="p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-full"
            >
                <PlusIcon className="h-5 w-5" />
            </button>
        </div>
    );
};