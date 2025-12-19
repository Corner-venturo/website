'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-[#CFA5A5]/15',
      iconColor: 'text-[#CFA5A5]',
      buttonBg: 'bg-[#CFA5A5] hover:bg-[#c49898]',
    },
    warning: {
      iconBg: 'bg-[#E0D6A8]/20',
      iconColor: 'text-[#C5B078]',
      buttonBg: 'bg-[#Cfb9a5] hover:bg-[#c0a996]',
    },
    info: {
      iconBg: 'bg-[#A5BCCF]/15',
      iconColor: 'text-[#A5BCCF]',
      buttonBg: 'bg-[#A5BCCF] hover:bg-[#96adc0]',
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 mx-5 max-w-sm w-full shadow-2xl border border-white/50 animate-modal-in">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 ${styles.iconBg} rounded-2xl flex items-center justify-center`}>
            {icon || defaultIcon}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mb-6">{description}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3.5 px-4 ${styles.buttonBg} text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  處理中
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
