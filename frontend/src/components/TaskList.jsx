function formatStatus(status) {
  return status === "DONE" ? "Completed" : "Pending";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
}

function StatusBadge({ status }) {
  if (status === "DONE") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
        ✓ Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
      ⏳ Pending
    </span>
  );
}

function TaskList({ tasks, onEdit, onDelete, isDeletingId }) {
  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <svg
          className="w-12 h-12 mb-3 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="text-xs mt-1">Create one using the form</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug">
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
          </div>

          {task.description && (
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {formatDate(task.createdAt)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-md transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                disabled={isDeletingId === task.id}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition disabled:opacity-50"
              >
                {isDeletingId === task.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;
