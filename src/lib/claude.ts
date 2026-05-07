import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function checkSubmission(
  lessonTitle: string,
  checkCriteria: string,
  submission: string
): Promise<{ passed: boolean; feedback: string; score: number }> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Ты — преподаватель практического курса по ИИ-инструментам.

Урок: ${lessonTitle}

Критерии успеха:
${checkCriteria}

Работа студента:
${submission}

Оцени работу строго по критериям. Ответь в JSON:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "конкретная обратная связь на русском языке, 2-3 предложения"
}

Будь конкретным в feedback: что именно хорошо, что можно улучшить.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  return {
    passed: false,
    feedback: "Не удалось обработать ответ. Попробуй ещё раз.",
    score: 0,
  };
}

export async function generateHint(
  lessonTitle: string,
  task: string,
  studentQuestion: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Урок: ${lessonTitle}
Задание: ${task}
Вопрос студента: ${studentQuestion}

Дай краткую подсказку (2-3 предложения), не раскрывая решение полностью.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
