const STATUS_OPTIONS = [
  { value: "ALL", label: "All Tasks" },
  { value: "PENDING", label: "Pending" },
  { value: "DONE", label: "Completed" },
];

function TaskFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default TaskFilter;
