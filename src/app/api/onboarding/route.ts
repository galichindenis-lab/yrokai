export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, SESSION_COOKIE } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { name, answers } = await req.json();

  const cookieStore = cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = uuidv4();
  }

  let user = await prisma.user.findUnique({ where: { sessionId } });

  if (!user) {
    user = await prisma.user.create({
      data: { sessionId, name: name || null },
    });
  } else if (name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  const path = await prisma.learningPath.findFirst({
    where: { slug: "ai-tools-mastery" },
  });

  if (path) {
    await prisma.userLearningPath.upsert({
      where: { userId_learningPathId: { userId: user.id, learningPathId: path.id } },
      update: {},
      create: { userId: user.id, learningPathId: path.id },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}

