-- CreateEnum
CREATE TYPE "RoutineCadence" AS ENUM ('DAILY', 'WEEKLY');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "definitionOfDone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Task" ADD COLUMN "checklist" JSONB;

-- AlterTable
ALTER TABLE "UserAutomationSetting" ADD COLUMN "stage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserAutomationSetting" ADD COLUMN "lastStageAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AutomationStageHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "stage" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineRule" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "cadence" "RoutineCadence" NOT NULL,
    "nextAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationStageHistory_userId_createdAt_idx" ON "AutomationStageHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationStageHistory_workspaceId_createdAt_idx" ON "AutomationStageHistory"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineRule_taskId_key" ON "RoutineRule"("taskId");

-- AddForeignKey
ALTER TABLE "AutomationStageHistory" ADD CONSTRAINT "AutomationStageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationStageHistory" ADD CONSTRAINT "AutomationStageHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineRule" ADD CONSTRAINT "RoutineRule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
