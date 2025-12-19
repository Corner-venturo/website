import { FormData, FormErrors } from "./types";

interface StepContactProps {
  formData: FormData;
  errors: FormErrors;
  onFormChange: (data: Partial<FormData>) => void;
}

export default function StepContact({ formData, errors, onFormChange }: StepContactProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--neutral-700)] mb-3">聯絡方式</h1>
        <p className="text-[var(--neutral-400)]">讓我們可以通知你重要的旅程資訊</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            手機號碼 <span className="text-[var(--error-text)]">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormChange({ phone: e.target.value })}
            placeholder="0912345678"
            className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border ${
              errors.phone ? "border-[var(--error-text)]" : "border-white/50"
            } text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition`}
          />
          {errors.phone && <p className="text-xs text-[var(--error-text)] mt-1">{errors.phone}</p>}
          <p className="text-xs text-[var(--neutral-400)] mt-1">用於接收訂單通知和重要訊息</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--neutral-600)] mb-2">
            居住地區 <span className="text-[var(--neutral-400)]">(選填)</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onFormChange({ location: e.target.value })}
            placeholder="例如：台北市"
            className="w-full px-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] placeholder-[var(--neutral-400)] focus:outline-none focus:ring-2 focus:ring-[var(--morandi-blue)]/30 transition"
          />
        </div>
      </div>
    </div>
  );
}
