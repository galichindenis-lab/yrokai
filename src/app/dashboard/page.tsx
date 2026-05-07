export const dynamic = 'force-dynamic';
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { getProgressPercent, formatXp } from "@/lib/utils";
import { Trophy, Flame, ArrowRight } from "lucide-react";
import ModuleCard from "@/components/dashboard/ModuleCard";

async function getDashboardData(userId: string) {
  const [path, userProgress, user] = await Promise.all([
    prisma.learningPath.findFirst({
      where: { slug: "ai-tools-mastery" },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, xp: true, type: true },
            },
          },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  return { path, userProgress, user };
}

export default async function DashboardPage() {
  const { user } = await getOrCreateUser();
  const { path, userProgress, user: userData } = await getDashboardData(user.id);

  const completedLessonIds = userProgress
    .filter((p) => p.lessonId)
    .map((p) => p.lessonId!);

  const completedSet = new Set(completedLessonIds);
  const totalLessons = path?.modules.flatMap((m) => m.lessons).length ?? 0;
  const completedLessons = completedSet.size;

  let firstUnlockedLesson: { id: string } | null = null;
  if (path) {
    for (const mod of path.modules) {
      for (const lesson of mod.lessons) {
        if (!completedSet.has(lesson.id)) {
          firstUnlockedLesson = { id: lesson.id };
          break;
        }
      }
      if (firstUnlockedLesson) break;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="font-bold text-xl text-gradient">
            YrokAI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="text-sm text-gray-400 hover:text-white transition">
              Портфолио
            </Link>
            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
              <Trophy className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">
                {formatXp(userData?.totalXp ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            {userData?.name ? `Привет, ${userData.name}!` : "Привет!"}
          </h1>
          <p className="text-gray-400">
            {completedLessons === 0
              ? "Начни первый урок — это займёт 15 минут."
              : `Завершено ${completedLessons} из ${totalLessons} уроков. Продолжай!`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass rounded-2xl p-5">
            <div className="text-gray-500 text-sm mb-1">Уроков завершено</div>
            <div className="text-2xl font-bold">
              {completedLessons}
              <span className="text-gray-600 text-lg">/{totalLessons}</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-gray-500 text-sm mb-1">Всего XP</div>
            <div className="text-2xl font-bold text-violet-400">
              {formatXp(userData?.totalXp ?? 0)}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-gray-500 text-sm mb-1">Прогресс</div>
            <div className="text-2xl font-bold">
              {getProgressPercent(completedLessons, totalLessons)}%
            </div>
          </div>
        </div>

        {firstUnlockedLesson && (
          <Link
            href={`/lessons/${firstUnlockedLesson.id}`}
            className="group flex items-center gap-4 gradient-primary rounded-2xl p-6 mb-10 hover:opacity-90 transition-opacity"
          >
            <div className="bg-white/20 rounded-xl p-3">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-80">Продолжить обучение</div>
              <div className="font-semibold text-lg">Следующий урок →</div>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

        <div>
          <h2 className="text-xl font-bold mb-6">Программа курса</h2>
          {path && (
            <div className="space-y-4">
              {path.modules.map((module, moduleIndex) => {
                const isLocked =
                  moduleIndex > 0 &&
                  path.modules.slice(0, moduleIndex).some((prev) =>
                    prev.lessons.some((l) => !completedSet.has(l.id))
                  );

                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    completedLessonIds={completedLessonIds}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
