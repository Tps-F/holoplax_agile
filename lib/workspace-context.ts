import { cookies } from "next/headers";
import prisma from "./prisma";

export async function resolveWorkspaceId(userId: string) {
  const cookieStore = await cookies();
  const preferred = cookieStore.get("workspaceId")?.value ?? null;

  if (preferred) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: preferred, userId } },
      select: { workspaceId: true },
    });
    if (membership) {
      return preferred;
    }
  }

  const fallback = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { workspaceId: true },
  });
  return fallback?.workspaceId ?? null;
}
