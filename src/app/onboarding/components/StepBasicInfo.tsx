import { FormData, FormErrors } from "./types";
import AvatarUpload from "./AvatarUpload";

interface StepBasicInfoProps {
  formData: FormData;
  errors: FormErrors;
  avatarPreview: string | null;
  onFormChange: (data: Partial<FormData>) => void;
  onAvatarChange: (file: File) => void;
}

export default function StepBasicInfo({
  formData,
  errors,
  avatarPreview,
  onFormChange,
  onAvatarChange,
}: StepBasicInfoProps) {
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
          <p className="text-xs text-[var(--neutral-400)] mt-1">這是其他旅伴看到的名稱</p>
        </div>
      </div>
    </div>
  );
}
