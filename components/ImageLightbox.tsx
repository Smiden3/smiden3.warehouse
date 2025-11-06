import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, images, currentIndex, onClose, onNext, onPrev }) => {
  if (!isOpen || images.length === 0) return null;

  const imageSrc = images[currentIndex] || 'https://placehold.co/800x800/cccccc/FFFFFF/png?text=No+Image';

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-10"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
        )}

        {/* Image */}
        <div className="relative max-w-[90vw] max-h-[90vh]">
          <img src={imageSrc} alt="Просмотр изображения" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-10"
            aria-label="Следующее изображение"
          >
            <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
        )}
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-4xl font-light bg-black/40 rounded-full w-10 h-10 flex items-center justify-center leading-none hover:bg-black/60 transition-colors"
          aria-label="Закрыть"
        >
          &times;
        </button>
      </div>
    </div>
  );
};