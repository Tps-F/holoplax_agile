import { requireAuth } from "../../../../lib/api-auth";
import {
  badRequest,
  handleAuthError,
  notFound,
  ok,
  serverError,
} from "../../../../lib/api-response";
import { logAudit } from "../../../../lib/audit";
import prisma from "../../../../lib/prisma";
import { resolveWorkspaceId } from "../../../../lib/workspace-context";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const workspaceId = await resolveWorkspaceId(userId);
    if (!workspaceId) {
      return badRequest("workspace is required");
    }
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const name = String(body.name ?? "").trim();
      if (!name) return badRequest("name is required");
      data.name = name;
    }
    if (body.capacityPoints !== undefined) {
      const capacity = Number(body.capacityPoints);
      if (!Number.isFinite(capacity) || capacity <= 0) {
        return badRequest("capacityPoints must be positive");
      }
      data.capacityPoints = capacity;
    }
    if (body.startedAt !== undefined) {
      data.startedAt = body.startedAt ? new Date(body.startedAt) : undefined;
    }
    if (body.plannedEndAt !== undefined) {
      data.plannedEndAt = body.plannedEndAt ? new Date(body.plannedEndAt) : null;
    }

    const updated = await prisma.sprint.updateMany({
      where: { id, workspaceId },
      data,
    });
    if (!updated.count) {
      return notFound("sprint not found");
    }
    const sprint = await prisma.sprint.findFirst({ where: { id, workspaceId } });
    await logAudit({
      actorId: userId,
      action: "SPRINT_UPDATE",
      targetWorkspaceId: workspaceId,
      metadata: { sprintId: id },
    });
    return ok({ sprint });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) return authError;
    console.error("PATCH /api/sprints/[id] error", error);
    return serverError("failed to update sprint");
  }
}
