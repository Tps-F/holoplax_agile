-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "plannedEndAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "TaskDependency" (
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("taskId","dependsOnId")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
