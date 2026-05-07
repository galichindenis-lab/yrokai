export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Пароль должен быть не менее 8 символов" }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "Пароль слишком длинный" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const safeName = name ? String(name).trim().slice(0, 100) : undefined;

  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  const anonUser = sessionId ? await prisma.user.findUnique({ where: { sessionId } }) : null;

  let user;
  if (anonUser && !anonUser.email) {
    user = await prisma.user.update({
      where: { id: anonUser.id },
      data: { email, passwordHash, name: safeName },
    });
  } else {
    const newSessionId = crypto.randomUUID();
    user = await prisma.user.create({
      data: { sessionId: newSessionId, email, passwordHash, name: safeName },
    });
  }

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
  });

  res.cookies.set(SESSION_COOKIE, user.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
