import Image from "next/image";
import { FormData } from "./types";

interface StepAboutProps {
  formData: FormData;
  avatarPreview: string | null;
  onFormChange: (data: Partial<FormData>) => void;
}

export default function StepAbout({ formData, avatarPreview, onFormChange }: StepAboutProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">關於你</h1>
        <p className="text-[var(--neutral-400)]">讓其他朋友更認識你（選填）</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            自我介紹
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => onFormChange({ bio: e.target.value })}
            placeholder="分享一些關於你自己的事，例如：喜歡的旅行方式、興趣愛好..."
            rows={4}
            maxLength={200}
            className="w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition resize-none"
          />
          <p className="text-xs text-[var(--neutral-400)] mt-1 text-right">
            {formData.bio.length}/200
          </p>
        </div>

        {/* Preview Card */}
        <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50">
          <p className="text-xs text-[var(--neutral-400)] mb-3">預覽你的個人資料</p>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--neutral-200)] overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--neutral-400)]">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--neutral-700)] truncate">
                {formData.display_name || "顯示名稱"}
              </h3>
              {formData.location && (
                <p className="text-sm text-[var(--neutral-400)] flex items-center gap-1 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {formData.location}
                </p>
              )}
              {formData.bio && (
                <p className="text-sm text-[var(--neutral-500)] mt-2 line-clamp-2">{formData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
