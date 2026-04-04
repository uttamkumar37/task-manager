import { useEffect, useState } from "react";

const DEFAULT_FORM = { title: "", description: "", status: "PENDING" };

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white transition";

function TaskForm({ initialTask, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    setFormData(
      initialTask
        ? { title: initialTask.title || "", description: initialTask.description || "", status: initialTask.status || "PENDING" }
        : DEFAULT_FORM
    );
  }, [initialTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ title: formData.title.trim(), description: formData.description.trim(), status: formData.status });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</label>
        <input name="title" value={formData.title} onChange={handleChange} required placeholder="Task title" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Optional details…" rows={3} className={inputCls + " resize-none"} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
        <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
          <option value="PENDING">Pending</option>
          <option value="DONE">Completed</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving…" : initialTask ? "Update Task" : "Create Task"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting}
            className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition disabled:opacity-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
