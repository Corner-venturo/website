interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps?: number;
}

export default function OnboardingHeader({ currentStep, totalSteps = 3 }: OnboardingHeaderProps) {
  return (
    <header className="flex-shrink-0 p-6">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--neutral-200)] text-white font-bold text-lg flex items-center justify-center">
            V
          </div>
          <span className="text-xl font-bold text-[var(--neutral-600)]">VENTURO</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                s <= currentStep ? "bg-[var(--morandi-blue)]" : "bg-[var(--neutral-200)]"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
