import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k XP`;
  return `${xp} XP`;
}

export function getProgressPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getToolColor(tool: string): string {
  const colors: Record<string, string> = {
    claude: "bg-violet-500",
    chatgpt: "bg-emerald-500",
    "claude-code": "bg-amber-500",
    "code-editor": "bg-blue-500",
    multi: "bg-rose-500",
  };
  return colors[tool] ?? "bg-gray-500";
}

export function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    claude: "Claude",
    chatgpt: "ChatGPT",
    "claude-code": "Claude Code",
    "code-editor": "AI Code Editor",
    multi: "Все инструменты",
  };
  return labels[tool] ?? tool;
}
