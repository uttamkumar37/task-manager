import { useEffect, useState } from "react";
import { getVisitorCount, registerVisitor } from "../services/publicService";

const VISITOR_KEY = "task-manager-visitor-registered";

function VisitorBadge({ variant = "fixed" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const registered = localStorage.getItem(VISITOR_KEY) === "1";
        const res = registered ? await getVisitorCount() : await registerVisitor();
        if (mounted) {
          setCount(res?.count ?? 0);
          if (!registered) localStorage.setItem(VISITOR_KEY, "1");
        }
      } catch { if (mounted) setCount(0); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const className =
    variant === "inline"
      ? "inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 select-none"
      : "fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg select-none";

  return (
    <div title="Approximate unique visitors" className={className}>
      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
      {count} visitors
    </div>
  );
}

export default VisitorBadge;
