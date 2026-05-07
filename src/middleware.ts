import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "yrokai_session";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const existing = req.cookies.get(SESSION_COOKIE);

  if (!existing) {
    res.cookies.set(SESSION_COOKIE, uuidv4(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
