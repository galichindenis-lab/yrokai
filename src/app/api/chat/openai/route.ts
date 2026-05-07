import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your-openai-key-here") {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new OpenAI({ apiKey });
  const { messages, lessonTitle, lessonTool } = await req.json();

  const systemMessage = {
    role: "system" as const,
    content: `Ты — умный ИИ-ассистент внутри учебного тренажёра по ИИ-инструментам.
Студент сейчас проходит урок: "${lessonTitle}" (инструмент: ${lessonTool}).

Твои правила:
- Помогай разобраться с заданием, давай подсказки и объяснения
- НЕ пиши готовое решение за студента — направляй, а не делай за него
- Отвечай на русском языке, кратко и по делу
- Если студент просит пример кода — давай, но с пояснением
- Будь дружелюбным и поддерживающим`,
  };

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [systemMessage, ...messages],
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
