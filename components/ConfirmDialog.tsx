import React from 'react';

export const ConfirmDialog: React.FC<{
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title = 'Подтверждение', message, confirmText = 'Удалить', cancelText = 'Отмена', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl bg-light-card dark:bg-dark-bg p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-light-text dark:text-dark-text">{title}</h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="rounded-lg px-4 py-2 bg-red-500 text-white hover:bg-red-600 text-sm font-semibold transition-colors">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
