interface StepActionsProps {
  step: number;
  isLoading: boolean;
  showSkip: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export default function StepActions({
  step,
  isLoading,
  showSkip,
  onBack,
  onNext,
  onSubmit,
  onSkip,
}: StepActionsProps) {
  return (
    <div className="flex gap-3 mt-10">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 text-[var(--neutral-600)] font-medium hover:bg-white/80 transition"
        >
          上一步
        </button>
      )}
      {step < 3 ? (
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3.5 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-xl font-medium shadow-[var(--shadow-blue)] transition"
        >
          下一步
        </button>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full py-3.5 bg-[var(--morandi-blue)] hover:bg-[var(--morandi-blue-dark)] text-white rounded-xl font-medium shadow-[var(--shadow-blue)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              "完成設定"
            )}
          </button>
          {showSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              className="w-full py-2 text-[var(--neutral-400)] text-sm hover:text-[var(--neutral-600)] transition"
            >
              略過，稍後再填
            </button>
          )}
        </div>
      )}
    </div>
  );
}
