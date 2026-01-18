-- CreateTable
CREATE TABLE "FocusQueue" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FocusQueue_workspaceId_computedAt_idx" ON "FocusQueue"("workspaceId", "computedAt");

-- AddForeignKey
ALTER TABLE "FocusQueue" ADD CONSTRAINT "FocusQueue_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
