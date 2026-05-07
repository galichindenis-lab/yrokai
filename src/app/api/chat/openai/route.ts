export const dynamic = 'force-dynamic'
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
    content: `РўС‹ вЂ” СѓРјРЅС‹Р№ РР-Р°СЃСЃРёСЃС‚РµРЅС‚ РІРЅСѓС‚СЂРё СѓС‡РµР±РЅРѕРіРѕ С‚СЂРµРЅР°Р¶С‘СЂР° РїРѕ РР-РёРЅСЃС‚СЂСѓРјРµРЅС‚Р°Рј.
РЎС‚СѓРґРµРЅС‚ СЃРµР№С‡Р°СЃ РїСЂРѕС…РѕРґРёС‚ СѓСЂРѕРє: "${lessonTitle}" (РёРЅСЃС‚СЂСѓРјРµРЅС‚: ${lessonTool}).

РўРІРѕРё РїСЂР°РІРёР»Р°:
- РџРѕРјРѕРіР°Р№ СЂР°Р·РѕР±СЂР°С‚СЊСЃСЏ СЃ Р·Р°РґР°РЅРёРµРј, РґР°РІР°Р№ РїРѕРґСЃРєР°Р·РєРё Рё РѕР±СЉСЏСЃРЅРµРЅРёСЏ
- РќР• РїРёС€Рё РіРѕС‚РѕРІРѕРµ СЂРµС€РµРЅРёРµ Р·Р° СЃС‚СѓРґРµРЅС‚Р° вЂ” РЅР°РїСЂР°РІР»СЏР№, Р° РЅРµ РґРµР»Р°Р№ Р·Р° РЅРµРіРѕ
- РћС‚РІРµС‡Р°Р№ РЅР° СЂСѓСЃСЃРєРѕРј СЏР·С‹РєРµ, РєСЂР°С‚РєРѕ Рё РїРѕ РґРµР»Сѓ
- Р•СЃР»Рё СЃС‚СѓРґРµРЅС‚ РїСЂРѕСЃРёС‚ РїСЂРёРјРµСЂ РєРѕРґР° вЂ” РґР°РІР°Р№, РЅРѕ СЃ РїРѕСЏСЃРЅРµРЅРёРµРј
- Р‘СѓРґСЊ РґСЂСѓР¶РµР»СЋР±РЅС‹Рј Рё РїРѕРґРґРµСЂР¶РёРІР°СЋС‰РёРј`,
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

