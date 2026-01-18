-- CreateEnum
CREATE TYPE "AiPrepType" AS ENUM ('EMAIL', 'IMPLEMENTATION', 'CHECKLIST');

-- CreateEnum
CREATE TYPE "AiPrepStatus" AS ENUM ('PENDING', 'APPROVED', 'APPLIED', 'REJECTED');

-- CreateTable
CREATE TABLE "AiPrepOutput" (
    "id" TEXT NOT NULL,
    "type" "AiPrepType" NOT NULL,
    "status" "AiPrepStatus" NOT NULL DEFAULT 'PENDING',
    "taskId" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "workspaceId" TEXT,

    CONSTRAINT "AiPrepOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiPrepOutput_taskId_createdAt_idx" ON "AiPrepOutput"("taskId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiPrepOutput" ADD CONSTRAINT "AiPrepOutput_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPrepOutput" ADD CONSTRAINT "AiPrepOutput_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPrepOutput" ADD CONSTRAINT "AiPrepOutput_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
