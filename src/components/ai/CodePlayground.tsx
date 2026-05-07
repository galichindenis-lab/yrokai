"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Play, Wand2, Copy, Check, Loader2, ChevronDown } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-500 text-sm">
      Загрузка редактора...
    </div>
  ),
});

type Language = "html" | "javascript" | "python";

const STARTER: Record<Language, string> = {
  html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Мой проект</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #0a0a0f; color: white; }
    h1 { color: #a78bfa; }
  </style>
</head>
<body>
  <h1>Привет, мир!</h1>
  <p>Измени этот код с помощью ИИ.</p>
</body>
</html>`,
  javascript: `// Напиши или попроси ИИ написать код

function greet(name) {
  return \`Привет, \${name}!\`;
}

console.log(greet("Студент"));`,
  python: `# Python — попроси ИИ написать код

def greet(name):
    return f"Привет, {name}!"

print(greet("Студент"))`,
};

const AI_ACTIONS = [
  { label: "Объясни код", prompt: "Объясни этот код пошагово, простыми словами" },
  { label: "Исправь ошибки", prompt: "Найди и исправь все ошибки в этом коде" },
  { label: "Улучши код", prompt: "Улучши этот код: сделай чище, эффективнее" },
  { label: "Напиши заново", prompt: "Перепиши этот код лучше, добавь комментарии" },
];

export default function CodePlayground() {
  const [language, setLanguage] = useState<Language>("html");
  const [code, setCode] = useState(STARTER.html);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showActions, setShowActions] = useState(false);

  function switchLanguage(lang: Language) {
    setLanguage(lang);
    setCode(STARTER[lang]);
    setAiResponse("");
    setShowPreview(false);
  }

  async function runAi(instruction: string) {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setAiResponse("");
    setShowActions(false);

    const res = await fetch("/api/code/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, instruction }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setAiResponse((prev) => prev + decoder.decode(value, { stream: true }));
    }
    setIsLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function applyAiCode() {
    const codeMatch = aiResponse.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
      setCode(codeMatch[1].trim());
      setAiResponse("");
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5 flex-wrap">
        {/* Language tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(["html", "javascript", "python"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                language === lang
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {lang === "html" ? "HTML" : lang === "javascript" ? "JS" : "Python"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {language === "html" && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                showPreview
                  ? "bg-emerald-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Play className="w-3 h-3" />
              {showPreview ? "Скрыть" : "Запустить"}
            </button>
          )}

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white transition"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Скопировано" : "Копировать"}
          </button>

          {/* AI actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-violet-600 hover:bg-violet-700 text-white transition"
            >
              <Wand2 className="w-3 h-3" />
              ИИ помощь
              <ChevronDown className="w-3 h-3" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                {AI_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => runAi(action.prompt)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
        <div style={{ height: "360px" }}>
          <MonacoEditor
            height="360px"
            language={language === "javascript" ? "javascript" : language}
            value={code}
            onChange={(val) => setCode(val ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              padding: { top: 12 },
            }}
          />
        </div>

        {showPreview && language === "html" && (
          <div className="border-l border-white/10 bg-white">
            <iframe
              srcDoc={code}
              className="w-full h-full"
              style={{ height: "360px" }}
              sandbox="allow-scripts"
              title="HTML preview"
            />
          </div>
        )}
      </div>

      {/* Custom prompt */}
      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
        <div className="flex gap-2">
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customPrompt.trim()) {
                runAi(customPrompt);
                setCustomPrompt("");
              }
            }}
            placeholder="Свой запрос к ИИ... (Enter)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 transition placeholder:text-gray-600"
          />
          <button
            onClick={() => { runAi(customPrompt); setCustomPrompt(""); }}
            disabled={!customPrompt.trim() || isLoading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg text-sm transition"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "→"}
          </button>
        </div>
      </div>

      {/* AI Response */}
      {(aiResponse || isLoading) && (
        <div className="border-t border-white/5 p-4 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-violet-400 font-medium flex items-center gap-1.5">
              <Wand2 className="w-3 h-3" />
              Ответ Claude
            </span>
            {!isLoading && aiResponse.includes("```") && (
              <button
                onClick={applyAiCode}
                className="text-xs bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-lg transition"
              >
                Применить код
              </button>
            )}
          </div>
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
            {aiResponse}
            {isLoading && <span className="animate-pulse">▋</span>}
          </div>
        </div>
      )}
    </div>
  );
}
