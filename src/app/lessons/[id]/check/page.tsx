export const dynamic = 'force-dynamic';
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function LessonCheckPage({ params }: Props) {
  const { user } = await getOrCreateUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { module: { select: { id: true, title: true } } },
  });

  if (!lesson) notFound();

  const lastSubmission = await prisma.exerciseSubmission.findFirst({
    where: { userId: user.id, lessonId: lesson.id },
    orderBy: { createdAt: "desc" },
  });

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });

  const allModuleLessons = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  const currentIndex = allModuleLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = allModuleLessons[currentIndex + 1];

  const isCompleted = progress?.status === "COMPLETED";
  const passed = lastSubmission?.passed ?? false;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
          <Link
            href={`/lessons/${lesson.id}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к уроку
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {!lastSubmission ? (
            <div className="text-center">
              <div className="text-6xl mb-6">🤔</div>
              <h1 className="text-2xl font-bold mb-3">Ещё нет проверки</h1>
              <p className="text-gray-400 mb-8">
                Вернись к уроку и отправь выполненное задание.
              </p>
              <Link
                href={`/lessons/${lesson.id}`}
                className="gradient-primary px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
              >
                К заданию
              </Link>
            </div>
          ) : (
            <div>
              {/* Result header */}
              <div className="text-center mb-8">
                {passed ? (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Отлично!</h1>
                    <p className="text-gray-400">Задание выполнено</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Почти!</h1>
                    <p className="text-gray-400">Нужно доработать</p>
                  </>
                )}
              </div>

              {/* Score */}
              {lastSubmission.score !== null && (
                <div className="glass rounded-2xl p-6 mb-6 text-center">
                  <div className="text-5xl font-bold mb-1">
                    <span className={passed ? "text-green-400" : "text-amber-400"}>
                      {lastSubmission.score}
                    </span>
                    <span className="text-gray-600 text-2xl">/100</span>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center justify-center gap-2 text-violet-400 mt-2">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">+{lesson.xp} XP заработано</span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {lastSubmission.feedback && (
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold mb-3 text-sm text-gray-400">
                    Обратная связь от ИИ
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{lastSubmission.feedback}</p>
                </div>
              )}

              {/* Submission preview */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="font-semibold mb-3 text-sm text-gray-400">Твой ответ</h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                  {lastSubmission.content}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {passed && nextLesson ? (
                  <Link
                    href={`/lessons/${nextLesson.id}`}
                    className="w-full flex items-center justify-center gap-2 gradient-primary py-4 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Следующий урок →
                  </Link>
                ) : passed ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 gradient-primary py-4 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    На дашборд →
                  </Link>
                ) : null}

                <Link
                  href={`/lessons/${lesson.id}`}
                  className="w-full flex items-center justify-center gap-2 glass py-4 rounded-xl font-medium hover:border-white/20 transition text-gray-300"
                >
                  {passed ? "Пересмотреть урок" : "Переделать задание"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
