import { requireAuth } from "../../../../lib/api-auth";
import {
  badRequest,
  handleAuthError,
  ok,
  serverError,
} from "../../../../lib/api-response";
import prisma from "../../../../lib/prisma";
import { resolveWorkspaceId } from "../../../../lib/workspace-context";

const CONFIDENCE_THRESHOLD = 0.7;

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const workspaceId = await resolveWorkspaceId(userId);
    const questions = await prisma.memoryQuestion.findMany({
      where: {
        status: "PENDING",
        confidence: { gte: CONFIDENCE_THRESHOLD },
        OR: [
          { userId },
          ...(workspaceId ? [{ workspaceId }] : []),
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        typeId: true,
        valueStr: true,
        valueNum: true,
        valueBool: true,
        valueJson: true,
        confidence: true,
        status: true,
        createdAt: true,
        type: {
          select: {
            key: true,
            scope: true,
            valueType: true,
            description: true,
          },
        },
      },
    });
    return ok({ questions });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) return authError;
    console.error("GET /api/memory/questions error", error);
    return serverError("failed to load memory questions");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const workspaceId = await resolveWorkspaceId(userId);
    const body = await request.json();
    const typeId = String(body.typeId ?? "");
    const confidence = Number(body.confidence ?? CONFIDENCE_THRESHOLD);
    const valueStr = body.valueStr ?? null;
    const valueNum = body.valueNum ?? null;
    const valueBool = body.valueBool ?? null;
    const valueJson = body.valueJson ?? null;

    if (!typeId) {
      return badRequest("typeId is required");
    }

    const type = await prisma.memoryType.findFirst({ where: { id: typeId } });
    if (!type) {
      return badRequest("invalid typeId");
    }
    if (type.scope === "WORKSPACE" && !workspaceId) {
      return badRequest("workspace is required");
    }

    const question = await prisma.memoryQuestion.create({
      data: {
        typeId,
        userId: type.scope === "USER" ? userId : null,
        workspaceId: type.scope === "WORKSPACE" ? workspaceId : null,
        valueStr,
        valueNum,
        valueBool,
        valueJson,
        confidence: Number.isFinite(confidence) ? confidence : CONFIDENCE_THRESHOLD,
      },
    });

    return ok({ question });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) return authError;
    console.error("POST /api/memory/questions error", error);
    return serverError("failed to create memory question");
  }
}
