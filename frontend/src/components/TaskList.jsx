import { useState } from "react";
import {
  formatDate,
  isTaskOverdue,
  isTerminalStatus,
  normalizeStatus,
  priorityClass,
  priorityLabel,
  statusClass,
  statusLabel,
} from "../utils/taskMeta";

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(priority)}`}>
      {priorityLabel(priority)}
    </span>
  );
}

function EmptyState({ title = "No tasks yet", helper = "Create your first task with the New Task button." }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.7}
            d="M9 5h6M9 12h6m-6 5h3M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
          />
        </svg>
      </div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function descriptionPreview(description) {
  const text = (description || "").trim();
  if (!text) return "";
  return text.length > 130 ? `${text.slice(0, 130).trim()}...` : text;
}

function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  isDeletingId,
  updatingStatusId,
  emptyTitle,
  emptyHelper,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (!tasks.length) return <EmptyState title={emptyTitle} helper={emptyHelper} />;

  const handleMenuAction = (action) => {
    setOpenMenuId(null);
    action();
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {tasks.map((task) => {
        const normalizedStatus = normalizeStatus(task.status);
        const overdue = isTaskOverdue(task);
        const isDeleting = isDeletingId === task.id;
        const isUpdatingStatus = updatingStatusId === task.id;
        const actionDisabled = isDeleting || isUpdatingStatus;
        const terminal = isTerminalStatus(task.status);
        const preview = descriptionPreview(task.description);
        const isMenuOpen = openMenuId === task.id;

        return (
          <article
            key={task.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {overdue && (
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Overdue
                    </span>
                  )}
                </div>

                <h3 className="mt-2 break-words text-base font-bold leading-snug text-slate-900">{task.title}</h3>
                {preview ? (
                  <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">{preview}</p>
                ) : (
                  <p className="mt-1 text-sm italic text-slate-400">No description added.</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {task.dueDate && (
                    <span className={overdue ? "font-semibold text-red-600" : ""}>Due {formatDate(task.dueDate)}</span>
                  )}
                  {task.createdAt && <span>Created {formatDate(task.createdAt)}</span>}
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-2 sm:justify-end"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpenMenuId(null);
                  }
                }}
              >
                {!terminal && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(task, "COMPLETED")}
                    disabled={actionDisabled}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingStatus ? "Updating..." : "Complete"}
                  </button>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((current) => (current === task.id ? null : task.id))}
                    disabled={actionDisabled}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    aria-label={`More actions for ${task.title}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleMenuAction(() => onEdit(task))}
                        className="flex w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleMenuAction(() => onStatusChange(task, "IN_PROGRESS"))}
                        disabled={normalizedStatus === "IN_PROGRESS"}
                        className="flex w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleMenuAction(() => onStatusChange(task, "COMPLETED"))}
                        disabled={normalizedStatus === "COMPLETED"}
                        className="flex w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleMenuAction(() => onDelete(task.id))}
                        disabled={isDeleting}
                        className="flex w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default TaskList;
