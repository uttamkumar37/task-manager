import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardStats from "../components/DashboardStats";
import LoadingIndicator from "../components/LoadingIndicator";
import SocialConnectPanel from "../components/SocialConnectPanel";
import TaskCreateDrawer from "../components/TaskCreateDrawer";
import TaskFilter from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import TaskTabs from "../components/TaskTabs";
import VisitorBadge from "../components/VisitorBadge";
import { useAuth } from "../hooks/useAuth";
import { toApiError } from "../services/api";
import { createTask, deleteTask, getTasks, updateTask } from "../services/taskService";
import {
  filterTasks,
  isTaskOverdue,
  normalizePriority,
  normalizeStatus,
  searchTasks,
} from "../utils/taskMeta";

function sortByCreatedAtDesc(tasks) {
  return [...tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function viewTitle(activeView) {
  if (activeView === "ALL") return "All tasks";
  if (activeView === "OVERDUE") return "Overdue tasks";
  if (activeView === "HIGH_PRIORITY") return "High priority tasks";
  if (activeView === "COMPLETED") return "Completed tasks";
  return "Recent tasks";
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState("RECENT");
  const [advancedStatus, setAdvancedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [error, setError] = useState("");
  const [flashMsg, setFlashMsg] = useState("");

  useEffect(() => {
    let alive = true;
    setError("");
    setIsLoadingTasks(true);

    getTasks()
      .then((data) => {
        if (alive) setTasks(sortByCreatedAtDesc(data));
      })
      .catch((e) => {
        if (alive) setError(toApiError(e, "Unable to load tasks").message);
      })
      .finally(() => {
        if (alive) setIsLoadingTasks(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const highPriority = tasks.filter((task) => ["HIGH", "URGENT"].includes(normalizePriority(task.priority))).length;
    return {
      total: tasks.length,
      inProgress: tasks.filter((task) => normalizeStatus(task.status) === "IN_PROGRESS").length,
      overdue: tasks.filter(isTaskOverdue).length,
      highPriority,
      completed: tasks.filter((task) => normalizeStatus(task.status) === "COMPLETED").length,
    };
  }, [tasks]);

  const viewTasks = useMemo(() => {
    const sortedTasks = sortByCreatedAtDesc(tasks);

    if (activeView === "RECENT") return sortedTasks.slice(0, 5);
    if (activeView === "OVERDUE") return sortedTasks.filter(isTaskOverdue);
    if (activeView === "HIGH_PRIORITY") {
      return sortedTasks.filter((task) => ["HIGH", "URGENT"].includes(normalizePriority(task.priority)));
    }
    if (activeView === "COMPLETED") return filterTasks(sortedTasks, "COMPLETED");
    if (advancedStatus !== "ALL") return filterTasks(sortedTasks, advancedStatus);
    return sortedTasks;
  }, [tasks, activeView, advancedStatus]);

  const visibleTasks = useMemo(() => searchTasks(viewTasks, searchQuery), [viewTasks, searchQuery]);

  const roleLabel = user?.role === "ROLE_ADMIN" ? "Admin" : "User";
  const formTitle = editingTask ? "Edit Task" : "New Task";
  const formDescription = editingTask ? "Update the selected task." : "Capture the task, priority, and due date.";

  const flash = (msg) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  const replaceTask = (updatedTask) => {
    setTasks((previous) => sortByCreatedAtDesc(previous.map((task) => (task.id === updatedTask.id ? updatedTask : task))));
    setEditingTask((current) => (current?.id === updatedTask.id ? updatedTask : current));
  };

  const openNewTask = () => {
    setEditingTask(null);
    setIsTaskDrawerOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsTaskDrawerOpen(true);
  };

  const closeTaskDrawer = () => {
    if (isSubmitting) return;
    setEditingTask(null);
    setIsTaskDrawerOpen(false);
  };

  const handleViewChange = (nextView) => {
    setActiveView(nextView);
    if (nextView !== "ALL") setAdvancedStatus("ALL");
  };

  const handleStatusFilterChange = (nextStatus) => {
    setAdvancedStatus(nextStatus);
    setActiveView("ALL");
  };

  const openMessages = () => {
    setIsMessagesOpen(true);
    setTimeout(() => {
      document.getElementById("social-messages")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleSubmitTask = async (payload) => {
    setError("");
    setIsSubmitting(true);

    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, payload);
        replaceTask(updated);
        flash("Task updated");
      } else {
        const created = await createTask(payload);
        setTasks((previous) => sortByCreatedAtDesc([created, ...previous]));
        flash("Task created");
      }
      setEditingTask(null);
      setIsTaskDrawerOpen(false);
      return true;
    } catch (e) {
      setError(toApiError(e, "Unable to save task").message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (task, nextStatus) => {
    setError("");
    setUpdatingStatusId(task.id);

    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        description: task.description || "",
        status: nextStatus,
        priority: normalizePriority(task.priority),
        dueDate: task.dueDate || null,
      });
      replaceTask(updated);
      flash(nextStatus === "COMPLETED" ? "Task marked completed" : "Task moved to in progress");
    } catch (e) {
      setError(toApiError(e, "Unable to update task status").message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);

    try {
      await deleteTask(id);
      setTasks((previous) => previous.filter((task) => task.id !== id));
      if (editingTask?.id === id) {
        setEditingTask(null);
        setIsTaskDrawerOpen(false);
      }
      flash("Task deleted");
    } catch (e) {
      setError(toApiError(e, "Unable to delete task").message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-blue-600">Task Manager</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome, <span className="font-semibold text-slate-800">{user?.username}</span>
              <span className="ml-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {roleLabel}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <VisitorBadge variant="inline" />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:py-8">
        {(error || flashMsg) && (
          <div className="flex flex-col gap-2">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {flashMsg && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {flashMsg}
              </p>
            )}
          </div>
        )}

        <DashboardStats stats={dashboardStats} />

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Workspace</h2>
              <p className="mt-1 text-sm text-slate-500">Focus on what needs attention next.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={openNewTask}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                + New Task
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("ALL")}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                View All Tasks
              </button>
              <button
                type="button"
                onClick={openMessages}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Messages
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">{viewTitle(activeView)}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"} shown
                </p>
              </div>
              <TaskTabs value={activeView} onChange={handleViewChange} />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8.5 3a5.5 5.5 0 103.44 9.793l3.133 3.134a.75.75 0 001.06-1.06l-3.134-3.133A5.5 5.5 0 008.5 3zM5 8.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, description, status, or priority"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <TaskFilter value={advancedStatus} onChange={handleStatusFilterChange} />
            </div>

            {isLoadingTasks ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <LoadingIndicator label="Loading tasks..." />
              </div>
            ) : (
              <>
                <TaskList
                  tasks={visibleTasks}
                  onEdit={openEditTask}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  isDeletingId={deletingId}
                  updatingStatusId={updatingStatusId}
                  emptyTitle={tasks.length ? "No matching tasks" : "No tasks yet"}
                  emptyHelper={
                    tasks.length
                      ? "Try clearing search or changing the selected view."
                      : "Create your first task with the + New Task button."
                  }
                />

                {activeView === "RECENT" && tasks.length > 5 && (
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => handleViewChange("ALL")}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Show all tasks
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <SocialConnectPanel
          defaultName={user?.username || ""}
          user={user}
          isOpen={isMessagesOpen}
          onOpenChange={setIsMessagesOpen}
        />
      </main>

      <TaskCreateDrawer
        open={isTaskDrawerOpen}
        title={formTitle}
        description={formDescription}
        onClose={closeTaskDrawer}
      >
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleSubmitTask}
          onCancel={closeTaskDrawer}
          isSubmitting={isSubmitting}
        />
      </TaskCreateDrawer>
    </div>
  );
}

export default DashboardPage;
