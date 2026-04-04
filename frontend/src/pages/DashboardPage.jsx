import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";
import SocialConnectPanel from "../components/SocialConnectPanel";
import TaskFilter from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../hooks/useAuth";
import { toApiError } from "../services/api";
import { createTask, deleteTask, getTasks, updateTask } from "../services/taskService";

function sortByCreatedAtDesc(tasks) {
  return [...tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tasks,           setTasks]           = useState([]);
  const [filterStatus,    setFilterStatus]    = useState("ALL");
  const [isLoadingTasks,  setIsLoadingTasks]  = useState(true);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);
  const [editingTask,     setEditingTask]     = useState(null);
  const [error,           setError]           = useState("");
  const [flashMsg,        setFlashMsg]        = useState("");

  useEffect(() => {
    let alive = true;
    setError(""); setIsLoadingTasks(true);
    getTasks(filterStatus)
      .then((data) => { if (alive) setTasks(sortByCreatedAtDesc(data)); })
      .catch((e)   => { if (alive) setError(toApiError(e, "Unable to load tasks").message); })
      .finally(()  => { if (alive) setIsLoadingTasks(false); });
    return () => { alive = false; };
  }, [filterStatus]);

  const formTitle = useMemo(() => (editingTask ? "Edit Task" : "New Task"), [editingTask]);

  const flash = (msg) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(""), 3000); };

  const handleSubmitTask = async (payload) => {
    setError(""); setIsSubmitting(true);
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, payload);
        setTasks((p) => sortByCreatedAtDesc(p.map((t) => (t.id === updated.id ? updated : t))));
        flash("Task updated");
      } else {
        const created = await createTask(payload);
        setTasks((p) => sortByCreatedAtDesc([created, ...p]));
        flash("Task created");
      }
      setEditingTask(null);
    } catch (e) { setError(toApiError(e, "Unable to save task").message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setError(""); setDeletingId(id);
    try {
      await deleteTask(id);
      setTasks((p) => p.filter((t) => t.id !== id));
      if (editingTask?.id === id) setEditingTask(null);
      flash("Task deleted");
    } catch (e) { setError(toApiError(e, "Unable to delete task").message); }
    finally { setDeletingId(null); }
  };

  const handleLogout = async () => { await logout(); navigate("/", { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top header ─────────────────────────────── */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">📋 Task Manager</h1>
            <p className="text-indigo-200 text-xs mt-0.5">
              Welcome, <span className="font-semibold text-white">{user?.username}</span>
              {user?.role === "ROLE_ADMIN" && (
                <span className="ml-2 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Admin</span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Flash messages */}
        {error    && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-5 py-3">{error}</p>}
        {flashMsg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">{flashMsg}</p>}

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* Left — Create / Edit */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">{formTitle}</h2>
              {editingTask && (
                <button onClick={() => setEditingTask(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
                  Cancel edit
                </button>
              )}
            </div>
            <TaskForm initialTask={editingTask} onSubmit={handleSubmitTask} onCancel={editingTask ? () => setEditingTask(null) : undefined} isSubmitting={isSubmitting} />
          </div>

          {/* Right — Task list */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800">
                Tasks
                {tasks.length > 0 && (
                  <span className="ml-2 text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{tasks.length}</span>
                )}
              </h2>
              <TaskFilter value={filterStatus} onChange={setFilterStatus} />
            </div>

            {isLoadingTasks
              ? <div className="flex justify-center py-10 text-slate-400"><LoadingIndicator label="Loading tasks…" /></div>
              : <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={handleDelete} isDeletingId={deletingId} />
            }
          </div>
        </div>

        {/* Connect panel — full width */}
        <SocialConnectPanel defaultName={user?.username || ""} user={user} />
      </main>
    </div>
  );
}

export default DashboardPage;

