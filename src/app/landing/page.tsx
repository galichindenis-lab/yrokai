import Link from "next/link";
import { ArrowRight, Brain, Code2, Zap, Target, CheckCircle2, Star } from "lucide-react";

const tools = [
  { name: "Claude", icon: "🧠", color: "bg-violet-500", desc: "Умный ИИ-ассистент" },
  { name: "ChatGPT", icon: "⚡", color: "bg-emerald-500", desc: "Генерация и анализ" },
  { name: "Claude Code", icon: "💻", color: "bg-amber-500", desc: "Код без программирования" },
  { name: "Cursor", icon: "🎯", color: "bg-blue-500", desc: "Умный редактор кода" },
];

const benefits = [
  { icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />, text: "Никакого опыта программирования не нужно" },
  { icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />, text: "Практика с реальными задачами" },
  { icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />, text: "4 проекта для портфолио" },
  { icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />, text: "Моментальная проверка заданий через ИИ" },
];

const testimonials = [
  {
    name: "Анна К.",
    role: "Маркетолог",
    text: "За 3 недели научилась автоматизировать отчёты и экономить 4 часа в день.",
    avatar: "А",
  },
  {
    name: "Михаил Р.",
    role: "Дизайнер",
    text: "Cursor помог создать первое приложение без знания кода. Это магия.",
    avatar: "М",
  },
  {
    name: "Елена В.",
    role: "Предприниматель",
    text: "Теперь использую Claude для каждого текста. Скорость выросла в 5 раз.",
    avatar: "Е",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">
            <span className="text-gradient">YrokAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="bg-violet-600 hover:bg-violet-700 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-blue-900/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            <Star className="w-4 h-4 fill-current" />
            Практика, а не теория
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Освой ИИ-инструменты{" "}
            <span className="text-gradient">за 30 дней</span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Практический тренажёр для тех, кто хочет работать быстрее с помощью ИИ — без опыта программирования.
          </p>

          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Claude, ChatGPT, Claude Code, Cursor — освоишь всё и создашь 4 реальных проекта.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="group flex items-center gap-2 bg-violet-600 hover:bg-violet-700 transition-all px-8 py-4 rounded-xl text-lg font-semibold w-full sm:w-auto justify-center"
            >
              Начать бесплатно
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 transition-all px-8 py-4 rounded-xl text-lg text-gray-300 w-full sm:w-auto justify-center"
            >
              Смотреть программу
            </Link>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500 mb-10 text-sm uppercase tracking-widest">
            Инструменты в программе
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="glass rounded-2xl p-6 text-center hover:border-white/20 transition-all"
              >
                <div className="text-4xl mb-3">{tool.icon}</div>
                <div className="font-semibold mb-1">{tool.name}</div>
                <div className="text-sm text-gray-500">{tool.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Как это работает
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Каждый урок — это конкретное задание, проверка и шаг вперёд
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <Brain className="w-6 h-6" />,
                title: "Читаешь теорию",
                desc: "Коротко и по делу. Только то, что нужно для задания.",
              },
              {
                step: "02",
                icon: <Code2 className="w-6 h-6" />,
                title: "Выполняешь задание",
                desc: "Реальная практика с настоящими ИИ-инструментами.",
              },
              {
                step: "03",
                icon: <Zap className="w-6 h-6" />,
                title: "Получаешь фидбек",
                desc: "ИИ проверяет работу и даёт конкретную обратную связь.",
              },
            ].map((item) => (
              <div key={item.step} className="glass rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/5">
                  {item.step}
                </div>
                <div className="bg-violet-500/20 rounded-xl p-3 w-fit mb-4 text-violet-400">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Для тех, кто хочет{" "}
              <span className="text-gradient">результат</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Не ещё один курс с видеолекциями. Тренажёр с практическими заданиями и моментальной проверкой.
            </p>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  {b.icon}
                  <span className="text-gray-300">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-8">
            <div className="space-y-4">
              {[
                { module: "Модуль 1", title: "Claude: первый ИИ-ассистент", lessons: 2, xp: 35 },
                { module: "Модуль 2", title: "ChatGPT для продуктивности", lessons: 2, xp: 35 },
                { module: "Модуль 3", title: "Claude Code: код без кода", lessons: 2, xp: 50 },
                { module: "Модуль 4", title: "Cursor: умный редактор", lessons: 2, xp: 55 },
                { module: "Модуль 5", title: "Финальный проект", lessons: 2, xp: 125 },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">{m.module}</div>
                    <div className="text-sm font-medium truncate">{m.title}</div>
                  </div>
                  <div className="text-xs text-violet-400 font-medium whitespace-nowrap">+{m.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Что говорят студенты</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{t.text}</p>
                <div className="flex gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Начни прямо сейчас
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Первый урок занимает 15 минут. Регистрация не нужна.
          </p>
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-3 gradient-primary px-10 py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Начать бесплатно
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-600 mt-4">Без регистрации · Бесплатно · 30 дней</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        <span className="text-gradient font-semibold">YrokAI</span> — практический тренажёр по ИИ-инструментам
      </footer>
    </div>
  );
}
