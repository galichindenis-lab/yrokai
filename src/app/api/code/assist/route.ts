export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { code, language, instruction } = await req.json();

  const prompt = instruction
    ? `${instruction}\n\nРљРѕРґ:\n\`\`\`${language}\n${code}\n\`\`\``
    : `РџСЂРѕР°РЅР°Р»РёР·РёСЂСѓР№ СЌС‚РѕС‚ ${language}-РєРѕРґ, РЅР°Р№РґРё РїСЂРѕР±Р»РµРјС‹ Рё СѓР»СѓС‡С€Рё РµРіРѕ. РћР±СЉСЏСЃРЅРё С‡С‚Рѕ РёР·РјРµРЅРёР» Рё РїРѕС‡РµРјСѓ.\n\n\`\`\`${language}\n${code}\n\`\`\``;

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system:
      "РўС‹ вЂ” РѕРїС‹С‚РЅС‹Р№ СЂР°Р·СЂР°Р±РѕС‚С‡РёРє Рё РїРµРґР°РіРѕРі. РџРѕРјРѕРіР°РµС€СЊ СЃС‚СѓРґРµРЅС‚Р°Рј СѓС‡РёС‚СЊСЃСЏ РїСЂРѕРіСЂР°РјРјРёСЂРѕРІР°РЅРёСЋ СЃ РїРѕРјРѕС‰СЊСЋ РР. РћС‚РІРµС‡Р°Р№ РЅР° СЂСѓСЃСЃРєРѕРј. Р”Р°РІР°Р№ СЂР°Р±РѕС‡РёР№ РєРѕРґ СЃ РѕР±СЉСЏСЃРЅРµРЅРёСЏРјРё.",
    messages: [{ role: "user", content: prompt }],
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

