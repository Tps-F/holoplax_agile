export const TASK_STATUS = {
  BACKLOG: "BACKLOG",
  SPRINT: "SPRINT",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_TYPE = {
  EPIC: "EPIC",
  PBI: "PBI",
  TASK: "TASK",
  ROUTINE: "ROUTINE",
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];

export const AUTOMATION_STATE = {
  NONE: "NONE",
  DELEGATED: "DELEGATED",
  PENDING_SPLIT: "PENDING_SPLIT",
  SPLIT_PARENT: "SPLIT_PARENT",
  SPLIT_CHILD: "SPLIT_CHILD",
  SPLIT_REJECTED: "SPLIT_REJECTED",
} as const;

export type AutomationState = (typeof AUTOMATION_STATE)[keyof typeof AUTOMATION_STATE];

export const SEVERITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

// Labels for display (Japanese)
export const SEVERITY_LABELS: Record<Severity, string> = {
  [SEVERITY.LOW]: "低",
  [SEVERITY.MEDIUM]: "中",
  [SEVERITY.HIGH]: "高",
};

// Reverse mapping for parsing Japanese input
export const SEVERITY_FROM_LABEL: Record<string, Severity> = {
  "低": SEVERITY.LOW,
  "中": SEVERITY.MEDIUM,
  "高": SEVERITY.HIGH,
};

export type TaskDTO = {
  id: string;
  title: string;
  description?: string;
  definitionOfDone?: string;
  checklist?: { id: string; text: string; done: boolean }[] | null;
  points: 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34;
  urgency: Severity;
  risk: Severity;
  status: TaskStatus;
  type?: TaskType;
  automationState?: AutomationState;
  routineCadence?: "DAILY" | "WEEKLY" | null;
  routineNextAt?: string | Date | null;
  parentId?: string | null;
  dueDate?: string | Date | null;
  assigneeId?: string | null;
  sprintId?: string | null;
  tags?: string[];
  dependencyIds?: string[];
  dependencies?: { id: string; title: string; status: TaskStatus }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type VelocityEntryDTO = {
  id: string;
  name: string;
  points: number;
  range: string;
  createdAt?: string | Date;
};

export type AutomationSettingDTO = {
  low: number;
  high: number;
  stage?: number;
  effectiveLow?: number;
  effectiveHigh?: number;
};

export type AiSuggestionDTO = {
  id: string;
  type: "TIP" | "SCORE" | "SPLIT";
  taskId?: string | null;
  inputTitle: string;
  inputDescription: string;
  output: string;
  createdAt?: string | Date;
};

export type SprintDTO = {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
  capacityPoints: number;
  startedAt?: string | Date;
  plannedEndAt?: string | Date | null;
  endedAt?: string | Date | null;
};
