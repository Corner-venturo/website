import { AuthMode } from "./types";

interface AuthFormProps {
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
  showPassword: boolean;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export default function AuthForm({
  mode,
  email,
  password,
  name,
  showPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm mx-auto w-full">
      {mode === "register" && (
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            你的名字
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="輸入你的名字"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 text-[#5C5C5C] placeholder-[#949494] focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50 transition"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
          電子信箱
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          data-form-type="other"
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 text-[#5C5C5C] placeholder-[#949494] focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50 transition"
          required
        />
      </div>

      {mode !== "forgot" && (
        <div>
          <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
            密碼
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="輸入密碼"
              autoComplete="current-password"
              data-form-type="other"
              className="w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 text-[#5C5C5C] placeholder-[#949494] focus:outline-none focus:ring-2 focus:ring-[#cfb9a5]/50 transition"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#949494] hover:text-[#5C5C5C] transition"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {mode === "register" && (
            <p className="text-xs text-[#949494] mt-1">密碼至少需要 6 個字元</p>
          )}
        </div>
      )}

      {mode === "login" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[#cfb9a5] hover:text-[#b09b88] font-medium transition"
          >
            忘記密碼？
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-[#cfb9a5] hover:bg-[#b09b88] text-white rounded-xl font-medium shadow-lg shadow-[#cfb9a5]/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {mode === "login" && "登入"}
            {mode === "register" && "建立帳號"}
            {mode === "forgot" && "發送重設連結"}
          </>
        )}
      </button>
    </form>
  );
}
