import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, lessonTitle, lessonTool } = await req.json();

  const system = `Ты — умный ИИ-ассистент внутри учебного тренажёра по ИИ-инструментам.
Студент сейчас проходит урок: "${lessonTitle}" (инструмент: ${lessonTool}).

Твои правила:
- Помогай разобраться с заданием, давай подсказки и объяснения
- НЕ пиши готовое решение за студента — направляй, а не делай за него
- Отвечай на русском языке, кратко и по делу
- Если студент просит пример кода — давай, но с пояснением
- Будь дружелюбным и поддерживающим`;

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system,
    messages,
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
