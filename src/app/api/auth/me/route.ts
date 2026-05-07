export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user || !user.email) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, totalXp: user.totalXp },
  });
}
