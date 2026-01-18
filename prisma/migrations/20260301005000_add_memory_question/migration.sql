-- CreateEnum
CREATE TYPE "MemoryQuestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'HOLD');

-- CreateTable
CREATE TABLE "MemoryQuestion" (
    "id" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "userId" TEXT,
    "workspaceId" TEXT,
    "valueStr" TEXT,
    "valueNum" DOUBLE PRECISION,
    "valueBool" BOOLEAN,
    "valueJson" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "status" "MemoryQuestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemoryQuestion_typeId_status_idx" ON "MemoryQuestion"("typeId", "status");

-- CreateIndex
CREATE INDEX "MemoryQuestion_userId_status_idx" ON "MemoryQuestion"("userId", "status");

-- CreateIndex
CREATE INDEX "MemoryQuestion_workspaceId_status_idx" ON "MemoryQuestion"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "MemoryQuestion" ADD CONSTRAINT "MemoryQuestion_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "MemoryType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryQuestion" ADD CONSTRAINT "MemoryQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryQuestion" ADD CONSTRAINT "MemoryQuestion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
