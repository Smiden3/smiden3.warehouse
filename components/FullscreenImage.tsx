import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface FullscreenImageProps {
  images: string[];
  currentIndex: number;
  alt?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const FullscreenImage: React.FC<FullscreenImageProps> = ({ images, currentIndex, alt = "", onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) return null;

  const imageSrc = images[currentIndex] || 'https://placehold.co/800x800/cccccc/FFFFFF/png?text=No+Image';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
      )}

      <div
        className="relative rounded-xl bg-black/50 shadow-xl overflow-hidden"
        style={{
          width: "min(90vw, 90vh, 800px)",
          height: "min(90vw, 90vh, 800px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain select-none"
          draggable={false}
        />
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full h-8 w-8 flex items-center justify-center bg-black/60 text-white text-xl hover:bg-black/80 transition-colors z-20"
        >
          &times;
        </button>
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
          aria-label="Следующее изображение"
        >
          <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
      )}
    </div>
  );
};