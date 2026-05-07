"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const steps = [
  {
    id: "goal",
    title: "Что хочешь освоить?",
    subtitle: "Выбери главную цель",
    options: [
      { id: "automate", label: "Автоматизировать рутину", icon: "⚡" },
      { id: "write", label: "Писать тексты быстрее", icon: "✍️" },
      { id: "code", label: "Создавать продукты без кода", icon: "💻" },
      { id: "portfolio", label: "Построить портфолио", icon: "🎯" },
    ],
  },
  {
    id: "experience",
    title: "Твой опыт с ИИ?",
    subtitle: "Честно — это поможет подобрать уровень",
    options: [
      { id: "none", label: "Никакого, слышал но не пробовал", icon: "🌱" },
      { id: "basic", label: "Иногда использую ChatGPT", icon: "🌿" },
      { id: "regular", label: "Регулярно работаю с ИИ", icon: "🌳" },
      { id: "advanced", label: "Пишу промпты профессионально", icon: "🚀" },
    ],
  },
  {
    id: "time",
    title: "Сколько времени готов уделять?",
    subtitle: "В день",
    options: [
      { id: "15min", label: "15 минут в день", icon: "⏱️" },
      { id: "30min", label: "30 минут в день", icon: "⏰" },
      { id: "1hour", label: "1 час в день", icon: "🕐" },
      { id: "more", label: "Столько, сколько нужно", icon: "💪" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isNameStep = currentStep === steps.length;

  async function handleStart() {
    setIsSubmitting(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answers }),
      });
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  }

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [step.id]: optionId }));
    setTimeout(() => {
      if (isLastStep) {
        setCurrentStep((s) => s + 1);
      } else {
        setCurrentStep((s) => s + 1);
      }
    }, 300);
  }

  const progressPercent = ((currentStep + 1) / (steps.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <div className="p-6 flex items-center justify-between">
        <div className="font-bold text-xl text-gradient">YrokAI</div>
        <div className="text-sm text-gray-500">
          {isNameStep ? steps.length + 1 : currentStep + 1} / {steps.length + 1}
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {!isNameStep ? (
            <div key={currentStep} className="animate-fade-in">
              <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
              <p className="text-gray-400 mb-10">{step.subtitle}</p>

              <div className="space-y-3">
                {step.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => selectOption(option.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      answers[step.id] === option.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                    {answers[step.id] === option.id && (
                      <CheckCircle2 className="w-5 h-5 text-violet-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="mt-8 flex items-center gap-2 text-gray-500 hover:text-gray-300 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold mb-2">Как тебя зовут?</h1>
              <p className="text-gray-400 mb-10">Необязательно, но так приятнее</p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Твоё имя"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-lg outline-none focus:border-violet-500 transition mb-6 placeholder:text-gray-600"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />

              <button
                onClick={handleStart}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 gradient-primary py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? "Настраиваем..." : "Начать обучение"}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 transition py-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
