-- CreateEnum
CREATE TYPE "SuggestionReaction" AS ENUM ('VIEWED', 'ACCEPTED', 'MODIFIED', 'REJECTED', 'IGNORED');

-- CreateTable
CREATE TABLE "AiSuggestionReaction" (
    "id" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "reaction" "SuggestionReaction" NOT NULL,
    "taskType" "TaskType",
    "taskPoints" INTEGER,
    "hourOfDay" INTEGER,
    "dayOfWeek" INTEGER,
    "wipCount" INTEGER,
    "flowState" DOUBLE PRECISION,
    "modification" JSONB,
    "viewedAt" TIMESTAMP(3),
    "reactedAt" TIMESTAMP(3),
    "latencyMs" INTEGER,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSuggestionReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiSuggestionReaction_suggestionId_idx" ON "AiSuggestionReaction"("suggestionId");

-- CreateIndex
CREATE INDEX "AiSuggestionReaction_userId_reaction_createdAt_idx" ON "AiSuggestionReaction"("userId", "reaction", "createdAt");

-- CreateIndex
CREATE INDEX "AiSuggestionReaction_workspaceId_reaction_createdAt_idx" ON "AiSuggestionReaction"("workspaceId", "reaction", "createdAt");

-- AddForeignKey
ALTER TABLE "AiSuggestionReaction" ADD CONSTRAINT "AiSuggestionReaction_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "AiSuggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestionReaction" ADD CONSTRAINT "AiSuggestionReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestionReaction" ADD CONSTRAINT "AiSuggestionReaction_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
