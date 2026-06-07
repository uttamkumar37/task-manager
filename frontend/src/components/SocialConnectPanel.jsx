import { useEffect, useState } from "react";
import { toApiError } from "../services/api";
import { getMessages, leaveMessage } from "../services/publicService";

const profiles = [
  { label: "GitHub", url: "https://github.com/uttamkumar37", color: "border-slate-300 text-slate-700 hover:bg-slate-50" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/uttamkumar37", color: "border-blue-200 text-blue-700 hover:bg-blue-50" },
  { label: "Instagram", url: "https://www.instagram.com/uttam__gaurav", color: "border-pink-200 text-pink-700 hover:bg-pink-50" },
];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition";

function messageCountLabel(count) {
  return `${count} public ${count === 1 ? "message" : "messages"}`;
}

function SocialConnectPanel({ defaultName = "", user = null, isOpen, onOpenChange }) {
  const [formData, setFormData] = useState({ name: defaultName, socialHandle: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [messages, setMessages] = useState([]);
  const [internalOpen, setInternalOpen] = useState(false);

  const expanded = typeof isOpen === "boolean" ? isOpen : internalOpen;
  const setExpanded = (nextValue) => {
    if (onOpenChange) onOpenChange(nextValue);
    else setInternalOpen(nextValue);
  };
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
      // The dashboard remains usable when the optional public message feed is unavailable.
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
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
      setSuccess("Message sent. Thank you!");
      setFormData((previous) => ({ ...previous, socialHandle: "", message: "" }));
      await loadMessages();
    } catch (err) {
      setError(toApiError(err, "Unable to send message").message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <section id="social-messages" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Social Messages</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">{messageCountLabel(messages.length)}</h2>
            <p className="mt-1 text-sm text-slate-500">Public messages stay separate from private tasks.</p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Open Messages
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="social-messages" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-blue-600">Social Messages</p>
          <h2 className="mt-1 text-base font-bold text-slate-900">{messageCountLabel(messages.length)}</h2>
          <p className="mt-1 text-sm text-slate-500">Public notes and profile links stay separate from private tasks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <a
              key={profile.label}
              href={profile.url}
              target="_blank"
              rel="noreferrer"
              className={`rounded-lg border bg-white px-3 py-2 text-xs font-semibold transition ${profile.color}`}
            >
              {profile.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        {user && (
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {isAdmin ? `All messages (${messages.length})` : "Your messages"}
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">No messages yet</p>
                <p className="mt-1 text-sm text-slate-500">Messages submitted from this panel will appear here.</p>
              </div>
            ) : (
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                {messages.map((msg, index) => (
                  <article key={msg.id || `${msg.name}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold text-slate-800">{msg.name}</p>
                      {msg.socialHandle && <span className="text-xs font-medium text-slate-500">{msg.socialHandle}</span>}
                      {isAdmin && msg.submittedBy && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          @{msg.submittedBy}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-slate-600">{msg.message}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Leave a message</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              placeholder="@handle optional"
              className={inputCls}
            />
          </div>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Write a short public message"
            rows={3}
            className={`${inputCls} resize-none`}
          />
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SocialConnectPanel;
