export const dynamic = 'force-dynamic';
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { ArrowLeft, Plus, ExternalLink, Trophy, Zap } from "lucide-react";
import { getToolColor, getToolLabel, formatXp } from "@/lib/utils";

export default async function PortfolioPage() {
  const { user } = await getOrCreateUser();

  const [artifacts, userData, completedCount] = await Promise.all([
    prisma.projectArtifact.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.progress.count({
      where: { userId: user.id, status: "COMPLETED", lessonId: { not: null } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Дашборд
          </Link>
          <div className="font-semibold">Моё портфолио</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-violet-400 mb-1">
              {artifacts.length}
            </div>
            <div className="text-sm text-gray-500">Проектов</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold mb-1">{completedCount}</div>
            <div className="text-sm text-gray-500">Уроков</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-violet-400 mb-1">
              {formatXp(userData?.totalXp ?? 0)}
            </div>
            <div className="text-sm text-gray-500">Всего XP</div>
          </div>
        </div>

        {/* Projects */}
        {artifacts.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold mb-3">Портфолио пока пусто</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Завершай проектные уроки (отмечены значком 🚀), и твои работы будут
              автоматически добавляться сюда.
            </p>
            <Link
              href="/dashboard"
              className="gradient-primary px-6 py-3 rounded-xl font-medium hover:opacity-90 transition inline-flex items-center gap-2"
            >
              Начать учиться
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-6">
              Проекты{" "}
              <span className="text-gray-500 font-normal">({artifacts.length})</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {artifacts.map((artifact) => (
                <div key={artifact.id} className="glass rounded-2xl p-6 hover:border-white/20 transition">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full text-white ${getToolColor(artifact.tool)}`}
                        >
                          {getToolLabel(artifact.tool)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{artifact.title}</h3>
                    </div>
                    {artifact.url && (
                      <a
                        href={artifact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition flex-shrink-0"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {artifact.description}
                  </p>
                  {artifact.content && (
                    <div className="bg-white/5 rounded-lg p-3 text-xs font-mono text-gray-400 line-clamp-3">
                      {artifact.content}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-4">
                    {new Date(artifact.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
