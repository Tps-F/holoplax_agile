import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DELEGATE_TAG = "auto-delegate";
const SPLIT_PARENT_TAG = "auto-split-parent";
const SPLIT_CHILD_TAG = "auto-split-child";
const PENDING_APPROVAL_TAG = "automation-needs-approval";
const SPLIT_REJECTED_TAG = "auto-split-rejected";

const AUTOMATION_TAGS = [
  DELEGATE_TAG,
  SPLIT_PARENT_TAG,
  SPLIT_CHILD_TAG,
  PENDING_APPROVAL_TAG,
  SPLIT_REJECTED_TAG,
];

const determineAutomationState = (tags) => {
  if (!Array.isArray(tags)) return "NONE";

  // Priority order matters: more specific states first
  if (tags.includes(SPLIT_REJECTED_TAG)) return "SPLIT_REJECTED";
  if (tags.includes(PENDING_APPROVAL_TAG)) return "PENDING_SPLIT";
  if (tags.includes(SPLIT_PARENT_TAG)) return "SPLIT_PARENT";
  if (tags.includes(SPLIT_CHILD_TAG)) return "SPLIT_CHILD";
  if (tags.includes(DELEGATE_TAG)) return "DELEGATED";

  return "NONE";
};

const removeAutomationTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => !AUTOMATION_TAGS.includes(tag));
};

const main = async () => {
  console.log("Starting automation state migration...");

  const tasks = await prisma.task.findMany({
    select: { id: true, tags: true },
  });

  console.log(`Found ${tasks.length} tasks to check`);

  let migratedCount = 0;

  for (const task of tasks) {
    const tags = task.tags ?? [];
    const hasAutomationTag = tags.some((tag) => AUTOMATION_TAGS.includes(tag));

    if (!hasAutomationTag) continue;

    const automationState = determineAutomationState(tags);
    const cleanedTags = removeAutomationTags(tags);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        automationState,
        tags: cleanedTags,
      },
    });

    console.log(`Migrated task ${task.id}: ${automationState}`);
    migratedCount++;
  }

  console.log(`Migration complete. ${migratedCount} tasks updated.`);
};

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
