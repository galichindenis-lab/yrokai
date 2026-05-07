"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { getToolColor, getToolLabel, getProgressPercent } from "@/lib/utils";

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
    tool: string;
    icon: string;
    coverColor: string;
    lessons: { id: string }[];
  };
  completedLessonIds: string[];
  isLocked: boolean;
}

export default function ModuleCard({ module, completedLessonIds, isLocked }: ModuleCardProps) {
  const completedCount = module.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const percent = getProgressPercent(completedCount, module.lessons.length);

  return (
    <Link
      href={isLocked ? "#" : `/modules/${module.id}`}
      onClick={(e) => isLocked && e.preventDefault()}
      className={`block glass rounded-2xl p-6 transition-all ${
        isLocked ? "opacity-50 cursor-not-allowed" : "hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${module.coverColor}20` }}
        >
          {module.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">Модуль {module.order}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getToolColor(module.tool)} text-white`}>
              {getToolLabel(module.tool)}
            </span>
            {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
          </div>
          <div className="font-semibold mb-1">{module.title}</div>
          <div className="text-sm text-gray-400 mb-3 line-clamp-1">{module.description}</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {completedCount}/{module.lessons.length} уроков
            </span>
          </div>
        </div>
        {!isLocked && <ArrowRight className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" />}
      </div>
    </Link>
  );
}
