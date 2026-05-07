"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  lessonTitle: string;
  lessonTool: string;
}

const tools = [
  { id: "claude", label: "Claude", color: "bg-violet-600", icon: "🧠" },
  { id: "chatgpt", label: "ChatGPT", color: "bg-emerald-600", icon: "⚡" },
];

async function streamResponse(
  tool: string,
  messages: Message[],
  lessonTitle: string,
  lessonTool: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const endpoint = tool === "claude" ? "/api/chat/claude" : "/api/chat/openai";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, lessonTitle, lessonTool }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.error === "OPENAI_API_KEY not configured") {
      onChunk("⚠️ ChatGPT не подключён. Добавь `OPENAI_API_KEY` в `.env` файл.");
    } else {
      onChunk("Ошибка соединения. Попробуй ещё раз.");
    }
    onDone();
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
  onDone();
}

export default function AiChatPanel({ lessonTitle, lessonTool }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTool, setActiveTool] = useState<"claude" | "chatgpt">("claude");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);

    await streamResponse(
      activeTool,
      newMessages,
      lessonTitle,
      lessonTool,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      },
      () => setIsStreaming(false)
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 w-10 border-l border-white/5 bg-[#0d0d14] flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-white transition p-1"
          title="Открыть ИИ-ассистент"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="mt-4 flex flex-col gap-3">
          {tools.map((t) => (
            <div
              key={t.id}
              className="text-lg"
              title={t.label}
              style={{ writingMode: "vertical-rl" }}
            >
              {t.icon}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] flex-shrink-0 border-l border-white/5 bg-[#0d0d14] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as "claude" | "chatgpt");
                setMessages([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTool === tool.id
                  ? `${tool.color} text-white`
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-gray-300 transition p-1.5 rounded"
              title="Очистить"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-500 hover:text-gray-300 transition p-1.5 rounded"
            title="Свернуть"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">
              {activeTool === "claude" ? "🧠" : "⚡"}
            </div>
            <div className="text-sm text-gray-400 mb-1">
              {activeTool === "claude" ? "Claude" : "ChatGPT"} готов помочь
            </div>
            <div className="text-xs text-gray-600">
              Задавай вопросы по уроку
            </div>
            <div className="mt-4 space-y-2">
              {[
                "Объясни задание проще",
                "Дай подсказку",
                "Как это работает?",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => {
                    setInput(hint);
                    textareaRef.current?.focus();
                  }}
                  className="block w-full text-left text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg px-3 py-2 transition border border-white/5"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                {activeTool === "claude" ? "🧠" : "⚡"}
              </div>
            )}
            <div
              className={`max-w-[260px] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-white/5 text-gray-200 rounded-tl-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 items-center text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">думает...</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спроси что угодно по уроку..."
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 transition resize-none placeholder:text-gray-600 max-h-32"
            style={{ overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl p-2.5 transition flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-700 mt-1.5 text-center">
          Enter — отправить · Shift+Enter — перенос
        </div>
      </div>
    </div>
  );
}
