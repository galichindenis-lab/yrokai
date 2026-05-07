"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Lock, Zap } from "lucide-react";

interface Props {
  lessonId: string;
  title: string;
  type: string;
  xp: number;
  isCompleted: boolean;
  isLocked: boolean;
}

const typeLabels: Record<string, string> = {
  THEORY: "Теория",
  PRACTICE: "Практика",
  PROJECT: "Проект",
};

const typeColors: Record<string, string> = {
  THEORY: "bg-blue-500/20 text-blue-400",
  PRACTICE: "bg-violet-500/20 text-violet-400",
  PROJECT: "bg-amber-500/20 text-amber-400",
};

export default function LessonLink({ lessonId, title, type, xp, isCompleted, isLocked }: Props) {
  return (
    <Link
      href={isLocked ? "#" : `/lessons/${lessonId}`}
      onClick={(e) => isLocked && e.preventDefault()}
      className={`flex items-center gap-4 glass rounded-xl p-5 transition-all ${
        isLocked
          ? "opacity-40 cursor-not-allowed"
          : isCompleted
          ? "border-green-500/30"
          : "hover:border-white/20"
      }`}
    >
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        ) : isLocked ? (
          <Lock className="w-6 h-6 text-gray-600" />
        ) : (
          <Circle className="w-6 h-6 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[type] ?? "bg-gray-500/20 text-gray-400"}`}>
            {typeLabels[type] ?? type}
          </span>
        </div>
        <div className="font-medium">{title}</div>
      </div>
      <div className="flex items-center gap-1 text-violet-400 text-sm font-medium flex-shrink-0">
        <Zap className="w-3.5 h-3.5" />
        {xp} XP
      </div>
    </Link>
  );
}
