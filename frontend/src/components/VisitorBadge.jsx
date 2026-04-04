import { useEffect, useState } from "react";
import { getVisitorCount, registerVisitor } from "../services/publicService";

const VISITOR_KEY = "task-manager-visitor-registered";

function VisitorBadge() {
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

  return (
    <div
      title="Approximate unique visitors"
      className="fixed top-3 right-4 z-50 flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg select-none"
    >
      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
      {count} visitors
    </div>
  );
}

export default VisitorBadge;
