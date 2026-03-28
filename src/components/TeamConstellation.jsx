import React from "react";
import { motion } from "framer-motion";
import { Check, CirclePlay, Plus } from "lucide-react";
import { TEAM, ME } from "../data";

const ALL_MEMBERS = [ME, ...TEAM];
const POSITIONS = [
  { left: "50%", top: "50%", size: "68px" },
  { left: "20%", top: "24%", size: "88px" },
  { left: "75%", top: "28%", size: "78px" },
  { left: "16%", top: "72%", size: "82px" },
  { left: "80%", top: "68%", size: "66px" },
  { left: "50%", top: "82%", size: "72px" },
];

function AvatarNode({ member, pos, onClick, index }) {
  const isUnread = member.status === "unread";
  const isMissing = member.status === "missing";
  const isRead = member.status === "read" || member.status === "posted";
  const isMe = member.id === 0;

  return (
    <motion.button
      type="button"
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center bg-transparent p-0"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onClick(member)}
      aria-label={isMe ? "Post your standup update" : `Open ${member.name}'s story`}
    >
      <div className="relative" style={{ width: pos.size, height: pos.size }}>
        {isUnread && (
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-[var(--color-coral)]"
            animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div
          className={`absolute inset-0 rounded-full border-[3px] ${
            isUnread
              ? "border-[var(--color-coral)]"
              : isMissing
                ? "border-dashed border-[color:rgba(26,24,22,0.2)]"
                : "border-[color:rgba(26,24,22,0.1)]"
          }`}
        />

        <div
          className={`absolute inset-[6px] rounded-full overflow-hidden ${
            isRead && !isMe ? "opacity-55 saturate-50" : ""
          }`}
        >
          <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full bg-[var(--color-faint)] object-cover" />
        </div>

        {isMe && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-app-bg)] bg-[var(--color-charcoal)] text-white">
            <Plus size={12} strokeWidth={3} />
          </div>
        )}

        {isRead && !isMe && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-app-bg)] bg-[var(--color-charcoal)] text-white">
            <Check size={10} strokeWidth={3} />
          </div>
        )}

        {isUnread && (
          <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[var(--color-app-bg)] bg-[var(--color-coral)]" />
        )}
      </div>

      <div className="mt-2 text-center">
        <p className={`text-[11px] font-bold leading-none ${isUnread ? "text-[var(--color-charcoal)]" : "text-[color:rgba(26,24,22,0.5)]"}`}>
          {isMe ? "You" : member.name.split(" ")[0]}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[color:rgba(26,24,22,0.35)]">
          {member.role}
        </p>
      </div>
    </motion.button>
  );
}

export default function TeamConstellation({ onMemberTap, onPlayAll }) {
  const missingCount = TEAM.filter((member) => member.status === "missing").length;

  return (
    <div className="flex h-full flex-col bg-[var(--color-app-bg)]">
      <div className="shrink-0 px-6 pt-12 pb-2">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">
          Friday, Mar 28
        </p>
        <h1 className="text-2xl font-black tracking-tighter text-[var(--color-charcoal)]">Openclaw</h1>
      </div>

      {missingCount > 0 && (
        <div className="shrink-0 px-6 pt-2">
          <p className="text-sm font-medium text-[color:rgba(26,24,22,0.5)]">
            {missingCount} teammate{missingCount > 1 ? "s haven't" : " hasn't"} posted yet.
          </p>
        </div>
      )}

      <div className="relative my-2 flex-1 w-full overflow-hidden">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
          <motion.line x1="20%" y1="24%" x2="50%" y2="50%" stroke="var(--color-charcoal)" strokeWidth="1" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
          <motion.line x1="75%" y1="28%" x2="50%" y2="50%" stroke="var(--color-charcoal)" strokeWidth="1" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
          <motion.line x1="16%" y1="72%" x2="50%" y2="50%" stroke="var(--color-charcoal)" strokeWidth="1" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} />
          <motion.line x1="80%" y1="68%" x2="50%" y2="50%" stroke="var(--color-charcoal)" strokeWidth="1" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
          <motion.line x1="50%" y1="82%" x2="50%" y2="50%" stroke="var(--color-charcoal)" strokeWidth="1" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
        </svg>

        {ALL_MEMBERS.map((member, idx) => (
          <AvatarNode key={member.id} member={member} pos={POSITIONS[idx]} onClick={onMemberTap} index={idx} />
        ))}
      </div>

      <div className="glass-panel shrink-0 border-t border-[color:rgba(26,24,22,0.05)] px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onPlayAll}
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[22px] bg-[var(--color-coral)] py-[18px] text-[17px] font-bold text-[var(--color-charcoal)] shadow-[0_8px_28px_rgba(247,155,131,0.45)]"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-[var(--color-coral)]">
            <CirclePlay size={16} fill="currentColor" />
          </div>
          Play All Updates
        </motion.button>
        <div className="mt-4 flex items-center justify-between px-1">
          <motion.button whileTap={{ scale: 0.96 }} className="min-h-[44px] px-2 text-xs font-semibold uppercase tracking-wide text-[color:rgba(26,24,22,0.4)]">
            My Stats
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onMemberTap({ id: 0, isPostFlow: true })}
            className="min-h-[44px] rounded-full border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] px-4 py-2.5 text-xs font-bold text-[var(--color-charcoal)] shadow-sm"
          >
            + Post Update
          </motion.button>
        </div>
      </div>
    </div>
  );
}
