import { requireAuth } from "../../../lib/api-auth";
import {
  badRequest,
  handleAuthError,
  ok,
  serverError,
} from "../../../lib/api-response";
import { logAudit } from "../../../lib/audit";
import prisma from "../../../lib/prisma";
import { resolveWorkspaceId } from "../../../lib/workspace-context";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const workspaceId = await resolveWorkspaceId(userId);
    if (!workspaceId) {
      return ok({ velocity: [] });
    }
    const velocity = await prisma.velocityEntry.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
    const recent = velocity.slice(0, 5).map((entry) => entry.points);
    const avg =
      recent.length > 0 ? recent.reduce((sum, value) => sum + value, 0) / recent.length : 0;
    const variance =
      recent.length > 0
        ? recent.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / recent.length
        : 0;
    const stdDev = Math.sqrt(variance);

    const sprints = await prisma.sprint.findMany({
      where: { workspaceId, status: "CLOSED" },
      orderBy: { endedAt: "desc" },
      take: 3,
    });
    const sprintIds = sprints.map((sprint) => sprint.id);
    const pbiTasks = sprintIds.length
      ? await prisma.task.findMany({
          where: { workspaceId, sprintId: { in: sprintIds }, type: "PBI" },
          select: { sprintId: true, status: true, points: true },
        })
      : [];
    const latestSprintId = sprints[0]?.id ?? null;
    const latestPbiTasks = latestSprintId
      ? pbiTasks.filter((task) => task.sprintId === latestSprintId)
      : [];
    const pbiDone = latestPbiTasks.filter((task) => task.status === "DONE");
    const pbiDonePoints = pbiDone.reduce((sum, task) => sum + task.points, 0);
    const pbiCompletionRate =
      latestPbiTasks.length > 0 ? pbiDone.length / latestPbiTasks.length : 0;

    return ok({
      velocity,
      summary: {
        avg,
        variance,
        stdDev,
        stableRange: avg ? `${Math.max(0, avg - stdDev).toFixed(1)}-${(avg + stdDev).toFixed(1)}` : null,
      },
      pbi: {
        sprintId: latestSprintId,
        doneCount: pbiDone.length,
        donePoints: pbiDonePoints,
        totalCount: latestPbiTasks.length,
        completionRate: pbiCompletionRate,
      },
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) return authError;
    console.error("GET /api/velocity error", error);
    return serverError("failed to load velocity");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const workspaceId = await resolveWorkspaceId(userId);
    if (!workspaceId) {
      return badRequest("workspace is required");
    }
    const body = await request.json();
    const { name, points, range } = body;
    if (!name || !points || !range) {
      return badRequest("name, points, range are required");
    }
    const entry = await prisma.velocityEntry.create({
      data: {
        name,
        points: Number(points),
        range,
        userId,
        workspaceId,
      },
    });
    await logAudit({
      actorId: userId,
      action: "VELOCITY_CREATE",
      targetWorkspaceId: workspaceId,
      metadata: { entryId: entry.id, points: entry.points },
    });
    return ok({ entry });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) return authError;
    console.error("POST /api/velocity error", error);
    return serverError("failed to create entry");
  }
}
