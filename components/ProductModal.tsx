import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'photos'> & { id?: string; photos: string[] }) => void;
  productToEdit?: Product | null;
  allCategories: string[];
}

// Allow string for temporary user input in numeric fields
type FormDataState = {
  name: string;
  category: string;
  quantity: number | string;
  price: number | string;
  photos: string[];
};


const initialFormState: FormDataState = {
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    photos: ['', ''],
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, allCategories }) => {
  const [formData, setFormData] = useState<FormDataState>(initialFormState);

  useEffect(() => {
    if (isOpen) {
        if (productToEdit) {
          setFormData({
            name: productToEdit.name,
            category: productToEdit.category,
            quantity: productToEdit.quantity,
            price: productToEdit.price,
            photos: [
              productToEdit.photos[0] || '',
              productToEdit.photos[1] || ''
            ],
          });
        } else {
          setFormData(initialFormState);
        }
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
     if (name === 'photo1' || name === 'photo2') {
        const index = name === 'photo1' ? 0 : 1;
        setFormData(prev => {
            const newPhotos = [...prev.photos];
            newPhotos[index] = value;
            return { ...prev, photos: newPhotos };
        });
    } else if (name === 'quantity' || name === 'price') {
      // Allow empty string for temporary input, or valid non-negative numbers
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If the value is '0', clear it on focus
    if (e.target.value === '0') {
      const { name } = e.target;
      setFormData(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If the field is empty on blur, set it back to 0
    if (e.target.value === '') {
      const { name } = e.target;
      setFormData(prev => ({ ...prev, [name]: 0 }));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataForSave = {
      ...formData,
      id: productToEdit?.id,
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
    };
    
    onSave(dataForSave);
    
    // If we are adding a new product, just clear the form for the next one
    if (!productToEdit) {
        setFormData(initialFormState);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-light-card dark:bg-dark-bg rounded-xl shadow-2xl p-6 w-full max-w-md m-4 relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">{productToEdit ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Наименование</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Категория</label>
            <input 
              type="text" 
              name="category" 
              id="category" 
              list="category-list"
              value={formData.category} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" 
            />
            <datalist id="category-list">
              {allCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Количество</label>
                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required min="0" className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
             </div>
             <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Цена (₽)</label>
                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required min="0" className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
             </div>
          </div>
          <div>
            <label htmlFor="photo1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL фото 1 (обязательно)</label>
            <input type="url" name="photo1" id="photo1" value={formData.photos[0]} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
          </div>
           <div>
            <label htmlFor="photo2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL фото 2 (опционально)</label>
            <input type="url" name="photo2" id="photo2" value={formData.photos[1]} onChange={handleChange} className="mt-1 block w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Отмена</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};