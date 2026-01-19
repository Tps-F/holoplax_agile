import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEVERITY_MAP = {
  "低": "LOW",
  "中": "MEDIUM",
  "高": "HIGH",
  // Fallbacks for already-migrated or English values
  "LOW": "LOW",
  "MEDIUM": "MEDIUM",
  "HIGH": "HIGH",
};

const mapSeverity = (value) => {
  if (!value) return "MEDIUM";
  const mapped = SEVERITY_MAP[value];
  return mapped ?? "MEDIUM";
};

const main = async () => {
  console.log("Starting severity migration...");

  // Update Tasks
  const tasks = await prisma.$queryRaw`
    SELECT id, urgency, risk FROM "Task"
    WHERE urgency IN ('低', '中', '高') OR risk IN ('低', '中', '高')
  `;

  console.log(`Found ${tasks.length} tasks to migrate`);

  for (const task of tasks) {
    const newUrgency = mapSeverity(task.urgency);
    const newRisk = mapSeverity(task.risk);

    await prisma.$executeRaw`
      UPDATE "Task"
      SET urgency = ${newUrgency}::\"Severity\", risk = ${newRisk}::\"Severity\"
      WHERE id = ${task.id}
    `;

    console.log(`Migrated task ${task.id}: urgency=${newUrgency}, risk=${newRisk}`);
  }

  console.log("Migration complete!");
};

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
