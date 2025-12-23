'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  icon?: ReactNode;
  duration?: number;
  variant?: 'success' | 'info' | 'warning' | 'error';
}

export default function Toast({
  isOpen,
  onClose,
  message,
  icon,
  duration = 3000,
  variant = 'success',
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen || !mounted) return null;

  const variantStyles = {
    success: {
      bg: 'bg-[#4A5A4A]',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      defaultIcon: 'check_circle',
    },
    info: {
      bg: 'bg-[#4A5A5A]',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      defaultIcon: 'info',
    },
    warning: {
      bg: 'bg-[#5A5A4A]',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      defaultIcon: 'warning',
    },
    error: {
      bg: 'bg-[#5A4A4A]',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      defaultIcon: 'error',
    },
  };

  const styles = variantStyles[variant];

  const toastContent = (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4">
      <div
        className={`${styles.bg} px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-sm pointer-events-auto animate-toast-in`}
      >
        <div className={`w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center`}>
          {icon || (
            <span className={`material-icons-round ${styles.iconColor}`}>
              {styles.defaultIcon}
            </span>
          )}
        </div>
        <span className="text-white font-medium text-sm">{message}</span>
      </div>

      <style jsx>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(toastContent, document.body);
}
