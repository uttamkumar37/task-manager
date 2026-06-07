function DashboardStats({ stats }) {
  const cards = [
    { label: "Total tasks", value: stats.total, tone: "text-slate-950", accent: "bg-slate-900" },
    { label: "In progress", value: stats.inProgress, tone: "text-blue-700", accent: "bg-blue-500" },
    { label: "Overdue", value: stats.overdue, tone: "text-red-600", accent: "bg-red-500" },
    { label: "High priority", value: stats.highPriority, tone: "text-amber-600", accent: "bg-amber-500" },
    { label: "Completed", value: stats.completed, tone: "text-emerald-700", accent: "bg-emerald-500" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{card.label}</p>
            <span className={`h-2 w-2 rounded-full ${card.accent}`} />
          </div>
          <p className={`mt-3 text-2xl font-bold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default DashboardStats;
