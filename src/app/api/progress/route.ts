import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionId) return NextResponse.json({ progress: [] });

  const user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) return NextResponse.json({ progress: [] });

  const progress = await prisma.progress.findMany({
    where: { userId: user.id },
    include: { lesson: { select: { title: true, xp: true } } },
  });

  return NextResponse.json({ progress });
}
