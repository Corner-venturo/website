import { useState, useEffect, useCallback } from "react";
import { FormData, FormErrors } from "./types";
import AvatarUpload from "./AvatarUpload";
import { useProfileStore } from "@/stores/profile-store";

interface StepBasicInfoProps {
  formData: FormData;
  errors: FormErrors;
  avatarPreview: string | null;
  onFormChange: (data: Partial<FormData>) => void;
  onAvatarChange: (file: File) => void;
  onUsernameValidChange?: (isValid: boolean) => void;
}

export default function StepBasicInfo({
  formData,
  errors,
  avatarPreview,
  onFormChange,
  onAvatarChange,
  onUsernameValidChange,
}: StepBasicInfoProps) {
  const { checkUsernameAvailable } = useProfileStore();
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameDebounce, setUsernameDebounce] = useState<NodeJS.Timeout | null>(null);

  // 驗證 username 格式
  const validateUsernameFormat = (username: string): boolean => {
    return /^[a-z0-9_]{3,20}$/.test(username);
  };

  // 檢查 username 是否可用
  const checkUsername = useCallback(async (username: string) => {
    if (!username) {
      setUsernameStatus('idle');
      onUsernameValidChange?.(false);
      return;
    }

    const normalizedUsername = username.toLowerCase().trim();

    if (!validateUsernameFormat(normalizedUsername)) {
      setUsernameStatus('invalid');
      onUsernameValidChange?.(false);
      return;
    }

    setUsernameStatus('checking');
    const isAvailable = await checkUsernameAvailable(normalizedUsername);
    setUsernameStatus(isAvailable ? 'available' : 'taken');
    onUsernameValidChange?.(isAvailable);
  }, [checkUsernameAvailable, onUsernameValidChange]);

  // 處理 username 變更（debounce）
  const handleUsernameChange = (value: string) => {
    const normalizedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onFormChange({ username: normalizedValue });

    if (usernameDebounce) {
      clearTimeout(usernameDebounce);
    }

    if (!normalizedValue) {
      setUsernameStatus('idle');
      onUsernameValidChange?.(false);
      return;
    }

    const timeout = setTimeout(() => {
      checkUsername(normalizedValue);
    }, 500);
    setUsernameDebounce(timeout);
  };

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (usernameDebounce) {
        clearTimeout(usernameDebounce);
      }
    };
  }, [usernameDebounce]);

  // 初始檢查
  useEffect(() => {
    if (formData.username) {
      checkUsername(formData.username);
    }
  }, []);

  const getStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return (
          <div className="w-5 h-5 border-2 border-[#A5BCCF] border-t-transparent rounded-full animate-spin" />
        );
      case 'available':
        return (
          <span className="material-icons-round text-[#A8BFA6] text-xl">check_circle</span>
        );
      case 'taken':
        return (
          <span className="material-icons-round text-[#CFA5A5] text-xl">cancel</span>
        );
      case 'invalid':
        return (
          <span className="material-icons-round text-[#E0D6A8] text-xl">warning</span>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (usernameStatus) {
      case 'checking':
        return '檢查中...';
      case 'available':
        return '此用戶名可以使用';
      case 'taken':
        return '此用戶名已被使用';
      case 'invalid':
        return '需要 3-20 字元，只能使用小寫字母、數字和底線';
      default:
        return '用於邀請好友和分享連結';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">讓我們認識你</h1>
        <p className="text-[var(--neutral-400)]">告訴我們一些基本資訊，打造專屬於你的旅行體驗</p>
      </div>

      {/* Avatar Upload */}
      <AvatarUpload avatarPreview={avatarPreview} onAvatarChange={onAvatarChange} />

      {/* Form Fields */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            真實姓名 <span className="text-[var(--error-text)]">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => onFormChange({ full_name: e.target.value })}
            placeholder="您的真實姓名"
            className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
              errors.full_name ? "border-[var(--error-text)]" : "border-white/50"
            } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
          />
          {errors.full_name && (
            <p className="text-xs text-[var(--error-text)] mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            顯示名稱 <span className="text-[var(--error-text)]">*</span>
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => onFormChange({ display_name: e.target.value })}
            placeholder="其他用戶看到的名稱"
            className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
              errors.display_name ? "border-[var(--error-text)]" : "border-white/50"
            } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
          />
          {errors.display_name && (
            <p className="text-xs text-[var(--error-text)] mt-1">{errors.display_name}</p>
          )}
          <p className="text-xs text-[var(--neutral-400)] mt-1">這是其他朋友看到的名稱</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            用戶名 <span className="text-[var(--neutral-400)] font-normal">(選填)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]">@</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="your_username"
              className={`w-full pl-9 pr-12 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
                errors.username
                  ? "border-[var(--error-text)]"
                  : usernameStatus === 'available'
                  ? "border-[#A8BFA6]"
                  : usernameStatus === 'taken'
                  ? "border-[#CFA5A5]"
                  : "border-white/50"
              } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          {errors.username ? (
            <p className="text-xs text-[var(--error-text)] mt-1">{errors.username}</p>
          ) : (
            <p className={`text-xs mt-1 ${
              usernameStatus === 'available' ? 'text-[#A8BFA6]' :
              usernameStatus === 'taken' ? 'text-[#CFA5A5]' :
              usernameStatus === 'invalid' ? 'text-[#E0D6A8]' :
              'text-[var(--neutral-400)]'
            }`}>
              {getStatusText()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
