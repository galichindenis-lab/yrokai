export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, lessonTitle, lessonTool } = await req.json();

  const system = `РўС‹ вЂ” СѓРјРЅС‹Р№ РР-Р°СЃСЃРёСЃС‚РµРЅС‚ РІРЅСѓС‚СЂРё СѓС‡РµР±РЅРѕРіРѕ С‚СЂРµРЅР°Р¶С‘СЂР° РїРѕ РР-РёРЅСЃС‚СЂСѓРјРµРЅС‚Р°Рј.
РЎС‚СѓРґРµРЅС‚ СЃРµР№С‡Р°СЃ РїСЂРѕС…РѕРґРёС‚ СѓСЂРѕРє: "${lessonTitle}" (РёРЅСЃС‚СЂСѓРјРµРЅС‚: ${lessonTool}).

РўРІРѕРё РїСЂР°РІРёР»Р°:
- РџРѕРјРѕРіР°Р№ СЂР°Р·РѕР±СЂР°С‚СЊСЃСЏ СЃ Р·Р°РґР°РЅРёРµРј, РґР°РІР°Р№ РїРѕРґСЃРєР°Р·РєРё Рё РѕР±СЉСЏСЃРЅРµРЅРёСЏ
- РќР• РїРёС€Рё РіРѕС‚РѕРІРѕРµ СЂРµС€РµРЅРёРµ Р·Р° СЃС‚СѓРґРµРЅС‚Р° вЂ” РЅР°РїСЂР°РІР»СЏР№, Р° РЅРµ РґРµР»Р°Р№ Р·Р° РЅРµРіРѕ
- РћС‚РІРµС‡Р°Р№ РЅР° СЂСѓСЃСЃРєРѕРј СЏР·С‹РєРµ, РєСЂР°С‚РєРѕ Рё РїРѕ РґРµР»Сѓ
- Р•СЃР»Рё СЃС‚СѓРґРµРЅС‚ РїСЂРѕСЃРёС‚ РїСЂРёРјРµСЂ РєРѕРґР° вЂ” РґР°РІР°Р№, РЅРѕ СЃ РїРѕСЏСЃРЅРµРЅРёРµРј
- Р‘СѓРґСЊ РґСЂСѓР¶РµР»СЋР±РЅС‹Рј Рё РїРѕРґРґРµСЂР¶РёРІР°СЋС‰РёРј`;

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

