export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABC123456789012345678901234567890";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt to prevent timing attacks
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !user.passwordHash || !valid) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  // Generate new sessionId on every login to prevent session fixation
  const newSessionId = crypto.randomUUID();

  // Delete anonymous user that had the old session cookie (if any)
  const oldSessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (oldSessionId && oldSessionId !== user.sessionId) {
    const anonUser = await prisma.user.findUnique({ where: { sessionId: oldSessionId } });
    if (anonUser && !anonUser.email) {
      await prisma.$transaction([
        prisma.user.delete({ where: { id: anonUser.id } }),
        prisma.user.update({ where: { id: user.id }, data: { sessionId: newSessionId } }),
      ]);
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { sessionId: newSessionId } });
    }
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { sessionId: newSessionId } });
  }

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, totalXp: user.totalXp },
  });

  res.cookies.set(SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
