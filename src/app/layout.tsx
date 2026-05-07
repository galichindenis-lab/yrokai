import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "YrokAI — Освой ИИ-инструменты за 30 дней",
  description:
    "Практический тренажёр по работе с Claude, ChatGPT, Claude Code и Cursor. Создай 4 проекта для портфолио.",
  openGraph: {
    title: "YrokAI — Освой ИИ-инструменты за 30 дней",
    description: "Практический тренажёр по работе с Claude, ChatGPT, Claude Code и Cursor.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
