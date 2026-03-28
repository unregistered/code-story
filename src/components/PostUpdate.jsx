import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitPullRequest, CheckSquare, Check } from "lucide-react";

const PR_STATUSES = ["OPEN", "MERGED", "DRAFT"];
const TICKET_STATUSES = ["IN REVIEW", "BLOCKED", "DONE"];
const PANEL_STYLES = {
  base: "w-full rounded-xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] px-4 py-3.5 text-base font-medium text-[var(--color-charcoal)] placeholder:text-[color:rgba(26,24,22,0.25)] shadow-sm",
  selected: "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white",
  idle: "text-[color:rgba(26,24,22,0.7)]",
};

export default function PostUpdate({ onClose, onPosted }) {
  const [text, setText] = useState("");
  const [attachType, setAttachType] = useState(null);
  const [prTitle, setPrTitle] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [prStatus, setPrStatus] = useState("OPEN");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketStatus, setTicketStatus] = useState("IN REVIEW");
  const [submitted, setSubmitted] = useState(false);

  const charLimit = 180;
  const charsLeft = charLimit - text.length;

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onPosted?.();
    }, 1800);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="absolute inset-0 z-50 flex flex-col bg-[var(--color-app-bg)]"
    >
      <div className="flex shrink-0 items-center justify-between px-5 pt-14 pb-4">
        <h2 className="text-xl font-black tracking-tight text-[var(--color-charcoal)]">Post Update</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:rgba(0,0,0,0.08)]"
        >
          <X size={16} strokeWidth={2.5} className="text-black/60" />
        </motion.button>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-64 flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-sage)]"
              >
                <Check size={36} strokeWidth={3} className="text-white" />
              </motion.div>
              <p className="text-lg font-bold text-[var(--color-charcoal)]">Update posted!</p>
              <p className="text-sm font-medium text-[color:rgba(26,24,22,0.5)]">Your team can see it now.</p>
            </motion.div>
          ) : (
            <motion.div key="form">
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">
                  What did you ship today?
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                    placeholder="Refactored the auth layer. Finally..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] px-4 py-4 text-base font-medium text-[var(--color-charcoal)] placeholder:text-[color:rgba(26,24,22,0.25)] shadow-sm"
                  />
                  <span className={`absolute bottom-3 right-4 text-xs font-semibold ${charsLeft < 20 ? "text-[var(--color-danger)]" : "text-[color:rgba(26,24,22,0.25)]"}`}>
                    {charsLeft}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">
                  Attach (optional)
                </label>
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAttachType(attachType === "pr" ? null : "pr")}
                    className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold ${
                      attachType === "pr" ? PANEL_STYLES.selected : `${PANEL_STYLES.idle} border-[color:rgba(26,24,22,0.1)] bg-[color:rgba(255,255,255,0.6)]`
                    }`}
                  >
                    <GitPullRequest size={14} />
                    Pull Request
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAttachType(attachType === "ticket" ? null : "ticket")}
                    className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold ${
                      attachType === "ticket" ? PANEL_STYLES.selected : `${PANEL_STYLES.idle} border-[color:rgba(26,24,22,0.1)] bg-[color:rgba(255,255,255,0.6)]`
                    }`}
                  >
                    <CheckSquare size={14} />
                    Ticket
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {attachType === "pr" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-3 overflow-hidden"
                  >
                    <input value={prNumber} onChange={(e) => setPrNumber(e.target.value)} placeholder="#420" className={PANEL_STYLES.base} />
                    <input value={prTitle} onChange={(e) => setPrTitle(e.target.value)} placeholder="feat/your-branch-name" className={`${PANEL_STYLES.base} font-mono`} />
                    <div className="flex gap-2">
                      {PR_STATUSES.map((status) => (
                        <motion.button
                          key={status}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPrStatus(status)}
                          className={`min-h-[44px] flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                            prStatus === status ? PANEL_STYLES.selected : "border-[color:rgba(26,24,22,0.1)] bg-[color:rgba(255,255,255,0.6)] text-[color:rgba(26,24,22,0.6)]"
                          }`}
                        >
                          {status}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {attachType === "ticket" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-3 overflow-hidden"
                  >
                    <input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="ENG-204 Your ticket title" className={PANEL_STYLES.base} />
                    <div className="flex gap-2">
                      {TICKET_STATUSES.map((status) => (
                        <motion.button
                          key={status}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTicketStatus(status)}
                          className={`min-h-[44px] flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                            ticketStatus === status ? PANEL_STYLES.selected : "border-[color:rgba(26,24,22,0.1)] bg-[color:rgba(255,255,255,0.6)] text-[color:rgba(26,24,22,0.6)]"
                          }`}
                        >
                          {status}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!submitted && (
        <div className="shrink-0 border-t border-[color:rgba(26,24,22,0.05)] bg-[var(--color-app-bg)] px-5 pt-3 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`w-full rounded-[22px] py-[18px] text-[17px] font-bold ${
              text.trim() ? "bg-[var(--color-charcoal)] text-[var(--color-app-bg)] shadow-lg" : "bg-black/10 text-black/25"
            }`}
          >
            Post to Team
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
