import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { getToolColor, getToolLabel } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import LessonLink from "@/components/lesson/LessonLink";

interface Props {
  params: { id: string };
}

export default async function ModulePage({ params }: Props) {
  const { user } = await getOrCreateUser();

  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      learningPath: { select: { title: true, slug: true } },
    },
  });

  if (!module) notFound();

  const progress = await prisma.progress.findMany({
    where: { userId: user.id, lessonId: { in: module.lessons.map((l) => l.id) } },
  });

  const completedIds = new Set(
    progress.filter((p) => p.status === "COMPLETED").map((p) => p.lessonId!)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Дашборд
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-5">
            <div
              className="text-3xl w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${module.coverColor}20` }}
            >
              {module.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getToolColor(module.tool)}`}>
                  {getToolLabel(module.tool)}
                </span>
                <span className="text-xs text-gray-500">Модуль {module.order}</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
              <p className="text-gray-400">{module.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>{module.lessons.length} уроков</span>
                <span>{module.lessons.reduce((sum, l) => sum + l.xp, 0)} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Уроки</h2>
          <div className="space-y-3">
            {module.lessons.map((lesson, index) => {
              const isCompleted = completedIds.has(lesson.id);
              const isLocked = index > 0 && !completedIds.has(module.lessons[index - 1].id);

              return (
                <LessonLink
                  key={lesson.id}
                  lessonId={lesson.id}
                  title={lesson.title}
                  type={lesson.type}
                  xp={lesson.xp}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
