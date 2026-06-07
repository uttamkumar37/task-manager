export const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "WAITING_REVIEW", label: "Waiting Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const FILTER_OPTIONS = [
  { value: "ALL", label: "All Tasks" },
  ...STATUS_OPTIONS,
  { value: "OVERDUE", label: "Overdue" },
  { value: "HIGH_PRIORITY", label: "High Priority" },
];

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export const STATUS_STYLES = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
  WAITING_REVIEW: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export const PRIORITY_STYLES = {
  LOW: "bg-slate-50 text-slate-600 border-slate-200",
  MEDIUM: "bg-sky-50 text-sky-700 border-sky-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_ALIASES = {
  PENDING: "TODO",
  DONE: "COMPLETED",
  TO_DO: "TODO",
};

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");
}

export function normalizeStatus(status) {
  const token = normalizeToken(status);
  return STATUS_ALIASES[token] || token || "TODO";
}

export function normalizePriority(priority) {
  const token = normalizeToken(priority);
  return PRIORITY_OPTIONS.some((option) => option.value === token) ? token : "MEDIUM";
}

export function statusLabel(status) {
  const normalized = normalizeStatus(status);
  return STATUS_OPTIONS.find((option) => option.value === normalized)?.label || "To Do";
}

export function priorityLabel(priority) {
  const normalized = normalizePriority(priority);
  return PRIORITY_OPTIONS.find((option) => option.value === normalized)?.label || "Medium";
}

export function statusClass(status) {
  return STATUS_STYLES[normalizeStatus(status)] || STATUS_STYLES.TODO;
}

export function priorityClass(priority) {
  return PRIORITY_STYLES[normalizePriority(priority)] || PRIORITY_STYLES.MEDIUM;
}

export function isTerminalStatus(status) {
  return ["COMPLETED", "CANCELLED"].includes(normalizeStatus(status));
}

export function parseDateOnly(value) {
  if (!value) return null;
  const raw = Array.isArray(value)
    ? `${value[0]}-${String(value[1]).padStart(2, "0")}-${String(value[2]).padStart(2, "0")}`
    : String(value).slice(0, 10);
  const date = new Date(`${raw}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isTaskOverdue(task) {
  const dueDate = parseDateOnly(task?.dueDate);
  if (!dueDate || isTerminalStatus(task?.status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function formatDate(value) {
  if (!value) return "";
  const date = parseDateOnly(value) || new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function filterTasks(tasks, filterValue) {
  if (!filterValue || filterValue === "ALL") return tasks;
  if (filterValue === "OVERDUE") return tasks.filter(isTaskOverdue);
  if (filterValue === "HIGH_PRIORITY") {
    return tasks.filter((task) => ["HIGH", "URGENT"].includes(normalizePriority(task.priority)));
  }

  return tasks.filter((task) => normalizeStatus(task.status) === filterValue);
}

export function searchTasks(tasks, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tasks;

  return tasks.filter((task) => {
    const values = [
      task.title,
      task.description,
      task.status,
      statusLabel(task.status),
      task.priority,
      priorityLabel(task.priority),
    ];
    return values.join(" ").toLowerCase().includes(normalizedQuery);
  });
}
