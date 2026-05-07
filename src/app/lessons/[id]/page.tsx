import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { ArrowLeft, ArrowRight, Zap, BookOpen, Target, Code2 } from "lucide-react";
import LessonTaskEditor from "@/components/lesson/LessonTaskEditor";
import AiChatPanel from "@/components/ai/AiChatPanel";
import CodePlayground from "@/components/ai/CodePlayground";

interface Props {
  params: { id: string };
}

export default async function LessonPage({ params }: Props) {
  const { user } = await getOrCreateUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      module: { select: { id: true, title: true, icon: true, tool: true } },
    },
  });

  if (!lesson) notFound();

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });

  const allModuleLessons = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  const currentIndex = allModuleLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = allModuleLessons[currentIndex + 1];
  const prevLesson = allModuleLessons[currentIndex - 1];
  const isCompleted = progress?.status === "COMPLETED";

  const typeLabels: Record<string, string> = {
    THEORY: "Теория",
    PRACTICE: "Практика",
    PROJECT: "Проект",
  };

  const isCodeLesson =
    lesson.module.tool === "code-editor" || lesson.type === "PROJECT";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40 flex-shrink-0">
        <div className="px-6 h-16 flex items-center justify-between">
          <Link
            href={`/modules/${lesson.module.id}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {lesson.module.title}
          </Link>
          <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            {lesson.xp} XP
          </div>
        </div>
      </nav>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: lesson content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">
                  {lesson.module.icon} {lesson.module.title}
                </span>
                <span className="text-gray-600">/</span>
                <span className="text-sm text-violet-400">
                  {typeLabels[lesson.type] ?? lesson.type}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{lesson.title}</h1>
            </div>

            {/* Theory */}
            <div className="glass rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
                <BookOpen className="w-4 h-4" />
                Теория
              </div>
              <div
                className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-code:text-violet-300 prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }}
              />
            </div>

            {/* Code Playground for code lessons */}
            {isCodeLesson && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 text-sm text-emerald-400">
                  <Code2 className="w-4 h-4" />
                  Редактор кода с ИИ
                </div>
                <CodePlayground />
              </div>
            )}

            {/* Task */}
            <div className="glass rounded-2xl p-8 mb-6 border-violet-500/20">
              <div className="flex items-center gap-2 mb-5 text-sm text-violet-400">
                <Target className="w-4 h-4" />
                Задание
              </div>
              <div
                className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-code:text-violet-300 prose-li:text-gray-300 mb-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.task) }}
              />
              <LessonTaskEditor
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                checkCriteria={lesson.checkCriteria}
                hint={lesson.hint ?? undefined}
                isCompleted={isCompleted}
                xp={lesson.xp}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pb-10">
              {prevLesson ? (
                <Link
                  href={`/lessons/${prevLesson.id}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Предыдущий
                </Link>
              ) : (
                <div />
              )}
              {nextLesson && isCompleted && (
                <Link
                  href={`/lessons/${nextLesson.id}`}
                  className="flex items-center gap-2 gradient-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
                >
                  Следующий
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Chat Panel */}
        <AiChatPanel
          lessonTitle={lesson.title}
          lessonTool={lesson.module.tool}
        />
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-violet-400 hover:text-violet-300 underline">$1</a>'
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hupla])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
