import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Loader2, GitMerge } from "lucide-react";

export default function PostUpdate({ onClose, onPosted, prefill, isOpen }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const prefilled = useRef(false);

  useEffect(() => {
    if (!isOpen || prefilled.current) return;
    prefilled.current = true;
    const content = prefill?.ticket?.description || prefill?.text?.replace(/\*\*/g, "") || "";
    if (!content) return;
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      for (let i = 0; i < content.length && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, 8 + Math.random() * 12));
        setText(content.slice(0, i + 1));
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  const charLimit = 180;
  const charsLeft = charLimit - text.length;

  const summarize = async () => {
    setIsSummarizing(true);
    const summary = "Matrix direct messages now route to the correct room — fixes misdelivered outbound messages in federated setups.";
    setText("");
    await new Promise((r) => setTimeout(r, 400));
    for (let i = 0; i < summary.length; i++) {
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
      setText(summary.slice(0, i + 1));
    }
    setIsSummarizing(false);
  };

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
      animate={{ y: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="absolute inset-0 z-50 flex flex-col bg-[var(--color-app-bg)]"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
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
              {prefill?.ticket && (
                <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.5)] px-4 py-3">
                  <GitMerge size={15} className="mt-0.5 shrink-0 text-[var(--color-sage)]" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-charcoal)] leading-snug">{prefill.ticket.title}</p>
                    <span className="mt-0.5 inline-block rounded-full bg-[var(--color-sage)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-sage)]">
                      {prefill.ticket.status}
                    </span>

                  </div>
                </div>
              )}

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

              {(text.length > 20 || prefill?.ticket?.description) && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={summarize}
                  disabled={isSummarizing}
                  className="flex items-center gap-1.5 rounded-full bg-[var(--color-sage)]/10 px-3.5 py-2 text-xs font-bold text-[var(--color-sage)] disabled:opacity-50"
                >
                  {isSummarizing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isSummarizing ? "Summarizing…" : "Summarize with Minimax"}
                </motion.button>
              )}

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
