'use client';

import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確定',
  cancelText = '取消',
  isLoading = false,
  variant = 'danger',
  icon,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  const defaultIcon = (
    <svg
      className={`w-8 h-8 ${styles.iconColor}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {variant === 'danger' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      )}
      {variant === 'warning' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      )}
      {variant === 'info' && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 ${styles.iconBg} rounded-full flex items-center justify-center`}>
            {icon || defaultIcon}
          </div>
          <h3 className="text-lg font-bold text-[#5C5C5C] mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-[#949494] mb-6">{description}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-[#5C5C5C] rounded-xl font-medium hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 ${styles.buttonBg} text-white rounded-xl font-medium transition disabled:opacity-50`}
              disabled={isLoading}
            >
              {isLoading ? '處理中...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
