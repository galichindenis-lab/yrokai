import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "yrokai_session";

export async function getOrCreateUser() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = uuidv4();
  }

  let user = await prisma.user.findUnique({ where: { sessionId } });

  if (!user) {
    user = await prisma.user.create({
      data: { sessionId },
    });
  }

  return { user, sessionId };
}

export async function getUserBySessionId(sessionId: string) {
  return prisma.user.findUnique({ where: { sessionId } });
}

export { SESSION_COOKIE };
