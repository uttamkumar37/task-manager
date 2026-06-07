import { useEffect, useMemo, useState } from "react";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  normalizePriority,
  normalizeStatus,
} from "../utils/taskMeta";

const DEFAULT_FORM = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
};

const TITLE_SUGGESTIONS = [
  "Daily standup update",
  "Complete backend task",
  "Review pull request",
  "Prepare deployment checklist",
  "Write unit tests",
  "Fix frontend UI issue",
  "Update README documentation",
  "Learn Spring Security",
  "Practice DSA problem",
  "Personal reminder",
];

const DESCRIPTION_MAX_LENGTH = 2000;

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition";

const labelCls = "text-xs font-semibold text-slate-500 uppercase";
const errorCls = "text-xs font-medium text-red-600";

function toDateInputValue(value) {
  if (!value) return "";
  if (Array.isArray(value)) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

function getInitialForm(initialTask) {
  if (!initialTask) return DEFAULT_FORM;

  return {
    title: initialTask.title || "",
    description: initialTask.description || "",
    status: normalizeStatus(initialTask.status),
    priority: normalizePriority(initialTask.priority),
    dueDate: toDateInputValue(initialTask.dueDate),
  };
}

function validateForm(formData) {
  const errors = {};
  const title = formData.title.trim();
  const description = formData.description.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = "Description must be 2000 characters or fewer.";
  }

  if (!formData.status) {
    errors.status = "Status is required.";
  }

  if (!formData.priority) {
    errors.priority = "Priority is required.";
  }

  return errors;
}

function TaskForm({ initialTask, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const submitLabel = useMemo(() => {
    if (isSubmitting) return initialTask ? "Updating..." : "Creating...";
    return initialTask ? "Update Task" : "Create Task";
  }, [initialTask, isSubmitting]);

  useEffect(() => {
    const nextForm = getInitialForm(initialTask);
    setFormData(nextForm);
    setErrors({});
    setSelectedSuggestion(TITLE_SUGGESTIONS.includes(nextForm.title) ? nextForm.title : "");
    setShowSuggestions(false);
    setShowAllSuggestions(false);
  }, [initialTask]);

  const setField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (name === "title") {
      setSelectedSuggestion(TITLE_SUGGESTIONS.includes(value) ? value : "");
    }
  };

  const handleSuggestion = (title) => {
    setField("title", title);
    setSelectedSuggestion(title);
  };

  const handleClearSuggestion = () => {
    setField("title", "");
    setSelectedSuggestion("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const success = await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
    });

    if (success !== false && !initialTask) {
      setFormData(DEFAULT_FORM);
      setSelectedSuggestion("");
      setErrors({});
      setShowSuggestions(false);
      setShowAllSuggestions(false);
    }
  };

  const visibleSuggestions = showAllSuggestions ? TITLE_SUGGESTIONS : TITLE_SUGGESTIONS.slice(0, 5);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="task-title" className={labelCls}>
            Title
          </label>
          {selectedSuggestion && (
            <button
              type="button"
              onClick={handleClearSuggestion}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Clear suggestion
            </button>
          )}
          {!selectedSuggestion && (
            <button
              type="button"
              onClick={() => setShowSuggestions((current) => !current)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              {showSuggestions ? "Hide suggestions" : "Use suggestion"}
            </button>
          )}
        </div>
        <input
          id="task-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Choose a suggestion or type your own"
          className={inputCls}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className={errorCls}>{errors.title}</p>}

        {showSuggestions && (
          <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex flex-wrap gap-1.5">
            {visibleSuggestions.map((title) => {
              const isSelected = selectedSuggestion === title;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => handleSuggestion(title)}
                  className={
                    "rounded-md border px-2.5 py-1.5 text-xs font-semibold transition " +
                    (isSelected
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100")
                  }
                >
                  {title}
                </button>
              );
            })}
          </div>
            {TITLE_SUGGESTIONS.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllSuggestions((current) => !current)}
                className="mt-2 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
              >
                {showAllSuggestions ? "Fewer suggestions" : "More suggestions"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-description" className={labelCls}>
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional details, blockers, or next steps"
          rows={4}
          className={`${inputCls} resize-none`}
          aria-invalid={Boolean(errors.description)}
        />
        <div className="flex items-center justify-between gap-3">
          {errors.description ? (
            <p className={errorCls}>{errors.description}</p>
          ) : (
            <span className="text-xs text-slate-400">Optional</span>
          )}
          <span className="text-xs text-slate-400">
            {formData.description.trim().length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-status" className={labelCls}>
            Status
          </label>
          <select
            id="task-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputCls}
            aria-invalid={Boolean(errors.status)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && <p className={errorCls}>{errors.status}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-priority" className={labelCls}>
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={inputCls}
            aria-invalid={Boolean(errors.priority)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority && <p className={errorCls}>{errors.priority}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-due-date" className={labelCls}>
          Due Date
        </label>
        <input
          id="task-due-date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          className={inputCls}
        />
        <p className="text-xs text-slate-400">Optional</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
