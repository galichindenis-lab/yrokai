"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lightbulb, Loader2, Send } from "lucide-react";

interface Props {
  lessonId: string;
  lessonTitle: string;
  checkCriteria: string;
  hint?: string;
  isCompleted: boolean;
  xp: number;
}

export default function LessonTaskEditor({
  lessonId,
  lessonTitle,
  checkCriteria,
  hint,
  isCompleted,
  xp,
}: Props) {
  const router = useRouter();
  const [submission, setSubmission] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    feedback: string;
    score: number;
  } | null>(null);

  async function handleSubmit() {
    if (!submission.trim() || isChecking) return;

    setIsChecking(true);
    setResult(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          content: submission,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.passed) {
        router.refresh();
      }
    } catch {
      setResult({
        passed: false,
        feedback: "Ошибка соединения. Попробуй ещё раз.",
        score: 0,
      });
    } finally {
      setIsChecking(false);
    }
  }

  if (isCompleted && !result) {
    return (
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div>
          <div className="font-medium text-green-400">Задание выполнено</div>
          <div className="text-sm text-gray-400">+{xp} XP заработано</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">Твой ответ</label>
      <textarea
        value={submission}
        onChange={(e) => setSubmission(e.target.value)}
        placeholder="Вставь сюда результат выполнения задания: промпт, ответ ИИ, код или описание того, что получилось..."
        rows={8}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition resize-none placeholder:text-gray-600 font-mono"
      />

      {/* Hint */}
      {hint && (
        <div className="mt-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? "Скрыть подсказку" : "Показать подсказку"}
          </button>
          {showHint && (
            <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">
              {hint}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`mt-4 rounded-xl p-5 border ${
            result.passed
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.passed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                <span className="text-red-400 text-xs">✕</span>
              </div>
            )}
            <span className={`font-semibold ${result.passed ? "text-green-400" : "text-red-400"}`}>
              {result.passed ? `Принято! +${xp} XP` : "Почти! Доработай"}
            </span>
            <span className="ml-auto text-sm text-gray-400">{result.score}/100</span>
          </div>
          <p className="text-sm text-gray-300">{result.feedback}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!submission.trim() || isChecking}
        className="mt-4 flex items-center gap-2 gradient-primary px-6 py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isChecking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Проверяю...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Проверить
          </>
        )}
      </button>

      <p className="text-xs text-gray-600 mt-2">
        ИИ проверит твой ответ по критериям задания
      </p>
    </div>
  );
}
