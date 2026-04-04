import { useEffect, useState } from "react";
import { toApiError } from "../services/api";
import { getMessages, leaveMessage } from "../services/publicService";

const profiles = [
  { label: "GitHub", url: "https://github.com/uttamkumar37", color: "bg-slate-800 text-white hover:bg-slate-700" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/uttamkumar37", color: "bg-blue-600 text-white hover:bg-blue-700" },
  { label: "Instagram", url: "https://www.instagram.com/uttam_iitg", color: "bg-pink-500 text-white hover:bg-pink-600" },
];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 focus:bg-white transition";

function SocialConnectPanel({ defaultName = "", user = null }) {
  const [formData, setFormData] = useState({ name: defaultName, socialHandle: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [messages, setMessages] = useState([]);

  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  async function loadMessages() {
    try {
      setMessages(await getMessages());
    } catch {
      // silently ignore — messages list is optional
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await leaveMessage({
        name: formData.name.trim(),
        socialHandle: formData.socialHandle.trim(),
        message: formData.message.trim(),
      });
      setSuccess("Message sent — thank you!");
      setFormData((p) => ({ ...p, socialHandle: "", message: "" }));
      await loadMessages();
    } catch (err) {
      setError(toApiError(err, "Unable to send message").message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mt-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-700">Connect with me</h2>
          <p className="text-xs text-slate-400 mt-0.5">Say hello or find me on social</p>
        </div>
        <div className="flex gap-2">
          {profiles.map((p) => (
            <a
              key={p.label}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${p.color}`}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Message wall */}
        {user && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {isAdmin ? `All messages (${messages.length})` : "Your messages"}
            </p>
            {messages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No messages yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700">
                      {msg.name}
                      {msg.socialHandle && <span className="font-normal text-slate-400"> · {msg.socialHandle}</span>}
                      {isAdmin && msg.submittedBy && <span className="font-normal text-indigo-400"> · @{msg.submittedBy}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leave a message form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Leave a message</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className={inputCls}
            />
            <input
              name="socialHandle"
              value={formData.socialHandle}
              onChange={handleChange}
              placeholder="@handle (optional)"
              className={inputCls}
            />
          </div>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Write something…"
            rows={2}
            className={inputCls + " resize-none"}
          />
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SocialConnectPanel;
