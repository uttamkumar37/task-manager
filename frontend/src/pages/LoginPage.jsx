import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";
import SocialConnectPanel from "../components/SocialConnectPanel";
import { useAuth } from "../hooks/useAuth";
import { toApiError } from "../services/api";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white transition";

function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, isCheckingAuth, login, register, user } = useAuth();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, isCheckingAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setIsLoading(true);
    const payload = { username: credentials.username.trim(), password: credentials.password };
    try {
      if (isRegisterMode) {
        await register(payload);
        setSuccess("Account created — please sign in.");
        setIsRegisterMode(false);
        setCredentials((p) => ({ ...p, password: "" }));
        return;
      }
      await login(payload);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(toApiError(err, "Unable to continue").message);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 gap-5">

      {/* Auth card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Card header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight">📋 Task Manager</h1>
          <p className="text-indigo-100 text-sm mt-1">
            {isRegisterMode ? "Create your free account" : "Welcome back — sign in to continue"}
          </p>
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Username</label>
              <input name="username" value={credentials.username} onChange={handleChange} required autoComplete="username" placeholder="e.g. john_doe" className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
              <input name="password" type="password" value={credentials.password} onChange={handleChange} required autoComplete="current-password" placeholder="••••••••" className={inputCls} />
            </div>

            {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>}
            {success && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">{success}</p>}

            <button type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {isLoading
                ? <LoadingIndicator label={isRegisterMode ? "Creating account…" : "Signing in…"} />
                : isRegisterMode ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button type="button" onClick={() => { setIsRegisterMode((v) => !v); setError(""); setSuccess(""); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
              {isRegisterMode ? "Already have an account? Sign in" : "No account? Create one for free"}
            </button>
          </div>
        </div>
      </div>

      {/* Connect panel below auth card */}
      <div className="w-full max-w-md">
        <SocialConnectPanel defaultName={credentials.username.trim()} user={user} />
      </div>
    </div>
  );
}

export default LoginPage;

