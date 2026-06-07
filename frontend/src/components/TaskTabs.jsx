const TABS = [
  { value: "RECENT", label: "Recent" },
  { value: "ALL", label: "All" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "HIGH_PRIORITY", label: "High Priority" },
  { value: "COMPLETED", label: "Completed" },
];

function TaskTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
      {TABS.map((tab) => {
        const isSelected = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition " +
              (isSelected
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:bg-white/80 hover:text-slate-900")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default TaskTabs;
