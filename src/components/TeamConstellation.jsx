import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Plus, Pencil, X, Send, Undo2, ChevronDown, FileEdit, Trash2, HelpCircle, Sparkles, MinusCircle, Settings } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { REPOS } from "../data";

function StoryText({ text }) {
  if (!text.includes("**")) return text;
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <span key={i}>{part.slice(2, -2)}</span>
      : <span key={i} className="font-light opacity-50">{part}</span>
  );
}

const TICKET_STATUS_CONFIG = {
  MERGED: { badgeClass: "bg-[var(--color-sage)] text-white", label: "Merged" },
  "IN REVIEW": { badgeClass: "bg-[var(--color-warning)] text-white", label: "In Review" },
  BLOCKED: { badgeClass: "bg-[var(--color-danger)] text-white", label: "Blocked" },
  DONE: { badgeClass: "bg-[var(--color-sage)] text-white", label: "Done" },
  OPEN: { badgeClass: "bg-[var(--color-warning)] text-white", label: "Open" },
};

function StoryBubble({ member, isMe, postState, hasRelevant, onClick }) {
  const isUnread = member.status === "unread";
  const isMissing = member.status === "missing";
  const isRead = member.status === "read" || member.status === "posted";
  const ringColor = hasRelevant && isUnread && !isMe ? "var(--color-relevant)" : "var(--color-coral)";

  const meBadge = postState === "posted"
    ? { bg: "bg-[var(--color-sage)]", icon: <Check size={10} strokeWidth={3} /> }
    : postState === "pending"
      ? { bg: "bg-[var(--color-warning)]", icon: <Clock size={10} strokeWidth={3} /> }
      : { bg: "bg-[var(--color-charcoal)]", icon: <Plus size={10} strokeWidth={3} /> };

  return (
    <motion.button
      type="button"
      className="flex shrink-0 flex-col items-center bg-transparent p-0"
      whileTap={{ scale: 0.93 }}
      onClick={() => onClick(member)}
      aria-label={isMe ? "Your updates" : `Open ${member.name}'s story`}
    >
      <div className="relative h-16 w-16">
        {isUnread && !isMe && (
          <motion.div
            className="absolute inset-0 rounded-full border-[3px]"
            style={{ borderColor: ringColor }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div
          className={`absolute inset-0 rounded-full border-[3px] ${
            isUnread && !isMe
              ? ""
              : isMissing
                ? "border-dashed border-[color:rgba(26,24,22,0.2)]"
                : "border-[color:rgba(26,24,22,0.1)]"
          }`}
          style={isUnread && !isMe ? { borderColor: ringColor } : undefined}
        />
        <div className={`absolute inset-[6px] overflow-hidden rounded-full ${isRead && !isMe ? "opacity-55 saturate-50" : ""}`}>
          <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full bg-[var(--color-faint)] object-cover" />
        </div>

        {isMe && (
          <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-app-bg)] ${meBadge.bg} text-white`}>
            {meBadge.icon}
          </div>
        )}
        {isRead && !isMe && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-app-bg)] bg-[var(--color-charcoal)] text-white">
            <Check size={10} strokeWidth={3} />
          </div>
        )}
        {isUnread && !isMe && (
          <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[var(--color-app-bg)]" style={{ backgroundColor: ringColor }} />
        )}
      </div>
      <p className={`mt-1.5 text-[11px] font-bold leading-none ${isUnread && !isMe ? "text-[var(--color-charcoal)]" : "text-[color:rgba(26,24,22,0.5)]"}`}>
        {isMe ? "You" : member.name.split(" ")[0]}
      </p>
    </motion.button>
  );
}

function TicketCard({ ticket }) {
  if (!ticket) return null;
  const config = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG["IN REVIEW"];
  return (
    <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.6)] px-4 py-3 text-left shadow-sm">
      <div>
        <div className="mb-0.5 flex items-center gap-2">
          <span className={`${config.badgeClass} rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide`}>{config.label}</span>
        </div>
        <p className="text-sm font-semibold tracking-tight text-[var(--color-charcoal)]">{ticket.title}</p>
      </div>
    </div>
  );
}

function PendingPostCard({ post, secondsRemaining, cancelled, onEdit, onCancel, onPostNow }) {
  const [showHelp, setShowHelp] = useState(false);
  const minutes = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const totalSeconds = Math.round((post.autoPostAt - post.landedAt) / 1000);
  const progressPct = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5">
      {!cancelled && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">Auto-posting in</span>
            <span className="rounded-md bg-[var(--color-coral)] px-2 py-0.5 text-xs font-bold text-[var(--color-charcoal)]">
              {minutes}:{secs.toString().padStart(2, "0")}
            </span>
            <button onClick={() => setShowHelp(!showHelp)} className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-[color:rgba(26,24,22,0.3)] hover:text-[color:rgba(26,24,22,0.6)]">
              <HelpCircle size={14} />
            </button>
            <button onClick={onCancel} className="flex h-6 w-6 items-center justify-center rounded-full text-[color:rgba(26,24,22,0.3)] hover:text-[color:rgba(26,24,22,0.6)]">
              <X size={14} />
            </button>
          </div>
          <AnimatePresence>
            {showHelp && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden text-xs font-medium leading-relaxed text-[color:rgba(26,24,22,0.45)]"
              >
                Your commits are summarized and posted automatically after landing. Edit before it goes live, post now, or cancel to skip this update.
              </motion.p>
            )}
          </AnimatePresence>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-black/5">
            <motion.div
              className="h-full rounded-full bg-[var(--color-coral)]"
              style={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </>
      )}

      {cancelled && (
        <div className="mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">Your Update</span>
        </div>
      )}

      <div className="rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.6)] p-5 shadow-sm">
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]"><StoryText text={post.text} /></p>
        <TicketCard ticket={post.ticket} />
      </div>

      <div className="mt-5 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onEdit}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-sm font-bold text-[var(--color-charcoal)] shadow-sm"
        >
          <Pencil size={14} /> Edit
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onPostNow}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-charcoal)] text-sm font-bold text-white shadow-lg"
        >
          <Send size={14} /> {cancelled ? "Post" : "Post Now"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function PostedCard({ post, onRetract }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">Your Update</span>
        <span className="rounded-md bg-[var(--color-sage)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Posted</span>
      </div>
      <div className="rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.6)] p-5 shadow-sm">
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]"><StoryText text={post.text} /></p>
        <TicketCard ticket={post.ticket} />
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onRetract}
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-sm font-bold text-[color:rgba(26,24,22,0.5)] shadow-sm"
      >
        <Undo2 size={14} /> Retract
      </motion.button>
    </motion.div>
  );
}

function DraftPostCard({ post, onEdit, onDiscard, onRepost }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">Draft</span>
        <span className="rounded-md bg-[var(--color-warning)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Retracted</span>
      </div>
      <p className="mb-4 text-xs font-medium text-[color:rgba(26,24,22,0.4)]">
        Your update was retracted. Edit and re-post, or discard it.
      </p>
      <div className="rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.6)] p-5 shadow-sm">
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]"><StoryText text={post.text} /></p>
        <TicketCard ticket={post.ticket} />
      </div>
      <div className="mt-5 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onEdit}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-sm font-bold text-[var(--color-charcoal)] shadow-sm"
        >
          <Pencil size={14} /> Edit
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onDiscard}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-sm font-bold text-[color:rgba(26,24,22,0.5)] shadow-sm"
        >
          <Trash2 size={14} /> Discard
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onRepost}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-charcoal)] text-sm font-bold text-white shadow-lg"
        >
          <Send size={14} /> Re-post
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyPostCard({ onPost }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center px-5 pt-8">
      <p className="mb-5 text-sm font-medium text-[color:rgba(26,24,22,0.4)]">No update posted</p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPost}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[22px] bg-[var(--color-charcoal)] py-[18px] text-[17px] font-bold text-[var(--color-app-bg)] shadow-lg"
      >
        <Plus size={18} strokeWidth={2.5} /> Post Update
      </motion.button>
    </motion.div>
  );
}

function RecentDiffsFeed({ posts, postStatuses, onPost, onDismiss, onRetract, onEdit }) {
  const timeAgo = (ts) => {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  const badgeFor = (status) => {
    if (status === "auto-posted") return { bg: "bg-[var(--color-sage)]", tc: "text-white", label: "Auto-posted", Icon: Sparkles };
    if (status === "posted") return { bg: "bg-[var(--color-sage)]", tc: "text-white", label: "Posted", Icon: Check };
    if (status === "skipped") return { bg: "bg-[var(--color-warning)]", tc: "text-white", label: "Skipped", Icon: X };
    return { bg: "bg-[color:rgba(26,24,22,0.08)]", tc: "text-[color:rgba(26,24,22,0.45)]", label: "Small change", Icon: MinusCircle };
  };

  if (!posts || posts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 px-5">
        <p className="text-center text-sm font-medium text-[color:rgba(26,24,22,0.3)]">All caught up</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 px-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">Recent Diffs</span>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {posts.map((post) => {
            const status = postStatuses[post.id] || "available";
            const badge = badgeFor(status);
            const showDismiss = status === "available" || status === "skipped";
            const showPost = status === "available" || status === "skipped";
            const showRetract = status === "auto-posted" || status === "posted";

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-[color:rgba(26,24,22,0.06)] bg-[color:rgba(255,255,255,0.6)] p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md ${badge.bg} px-2 py-0.5 text-[10px] font-extrabold uppercase ${badge.tc}`}>
                    <badge.Icon size={10} /> {badge.label}
                  </span>
                  <span className="text-[10px] font-medium text-[color:rgba(26,24,22,0.3)]">{timeAgo(post.landedAt)}</span>
                  {(showDismiss || showPost || showRetract) && (
                    <div className="ml-auto flex gap-1.5">
                      {showDismiss && (
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onDismiss(post.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[color:rgba(26,24,22,0.4)]">
                          <X size={14} />
                        </motion.button>
                      )}
                      {showRetract && (
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onRetract(post.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[color:rgba(26,24,22,0.4)]">
                          <Undo2 size={14} />
                        </motion.button>
                      )}
                      {showPost && (
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onEdit(post)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[color:rgba(26,24,22,0.4)]">
                          <Pencil size={12} />
                        </motion.button>
                      )}
                      {showPost && (
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onPost(post.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-white">
                          <Send size={12} />
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[13px] font-semibold leading-snug text-[var(--color-charcoal)]"><StoryText text={post.text} /></p>
                {post.ticket && (
                  <p className="mt-1.5 font-mono text-[11px] font-medium text-[color:rgba(26,24,22,0.4)]">{post.ticket.title}</p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function TeamConstellation({ repo, readStories, allMembers, currentMeId, onSetMe, onResetData, onRepoChange, onMemberTap, onEditPost }) {
  const [showSettings, setShowSettings] = useState(false);
  const [postStatuses, setPostStatuses] = useState(() => {
    const map = {};
    for (const p of (repo.pendingPosts || [])) {
      if (p.autoPosted) map[p.id] = "auto-posted";
      else if (p.autoPostAt) map[p.id] = "pending";
      else if (p.aiTag === "small") map[p.id] = "available";
    }
    return map;
  });
  const [undoAction, setUndoAction] = useState(null);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  const pendingPost = (repo.pendingPosts || []).find(p => postStatuses[p.id] === "pending");
  const hasPosted = (repo.pendingPosts || []).some(p => postStatuses[p.id] === "posted" || postStatuses[p.id] === "auto-posted");
  const feedPosts = (repo.pendingPosts || []).filter(p => p !== pendingPost && postStatuses[p.id] !== "dismissed");
  const bubblePostState = hasPosted ? "posted" : pendingPost ? "pending" : "empty";

  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    pendingPost ? Math.max(0, Math.round((pendingPost.autoPostAt - Date.now()) / 1000)) : 0
  );

  // Reset state when repo changes
  useEffect(() => {
    const map = {};
    for (const p of (repo.pendingPosts || [])) {
      if (p.autoPosted) map[p.id] = "auto-posted";
      else if (p.autoPostAt) map[p.id] = "pending";
      else if (p.aiTag === "small") map[p.id] = "available";
    }
    setPostStatuses(map);
    setUndoAction(null);
  }, [repo.id]);

  const missingCount = repo.team.filter((m) => m.status === "missing").length;

  useEffect(() => {
    if (!pendingPost) return;
    setSecondsRemaining(Math.max(0, Math.round((pendingPost.autoPostAt - Date.now()) / 1000)));
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setPostStatuses((s) => ({ ...s, [pendingPost.id]: "posted" }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pendingPost?.id]);

  useEffect(() => {
    if (!undoAction) return;
    const t = setTimeout(() => setUndoAction(null), 4000);
    return () => clearTimeout(t);
  }, [undoAction]);

  const handleBubbleTap = (member) => {
    onMemberTap(member);
  };

  const handleEdit = () => {
    if (!pendingPost) return;
    onEditPost?.({ text: pendingPost.text, ticket: pendingPost.ticket });
  };

  const handleCancel = () => {
    if (!pendingPost) return;
    setPostStatuses((s) => ({ ...s, [pendingPost.id]: "skipped" }));
  };

  const handlePostNow = () => {
    if (!pendingPost) return;
    setPostStatuses((s) => ({ ...s, [pendingPost.id]: "posted" }));
  };


  const handleFeedPost = (postId) => {
    const prev = postStatuses[postId];
    setPostStatuses((s) => ({ ...s, [postId]: "posted" }));
    setUndoAction({ postId, previousStatus: prev, label: "Posted" });
  };

  const handleFeedRetract = (postId) => {
    setPostStatuses((s) => ({ ...s, [postId]: "available" }));
  };

  const handleFeedDismiss = (postId) => {
    const prev = postStatuses[postId];
    setPostStatuses((s) => ({ ...s, [postId]: "dismissed" }));
    setUndoAction({ postId, previousStatus: prev, label: "Dismissed" });
  };

  const handleUndo = () => {
    if (!undoAction) return;
    setPostStatuses((s) => ({ ...s, [undoAction.postId]: undoAction.previousStatus }));
    setUndoAction(null);
  };

  const handleFeedEdit = (post) => {
    onEditPost?.({ text: post.text, ticket: post.ticket });
  };

  const handlePost = () => {
    onEditPost?.(null);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--color-app-bg)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-12 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">
              Friday, Mar 28
            </p>
            <button
              type="button"
              className="flex items-center gap-1 bg-transparent p-0"
              onClick={() => setShowRepoDropdown((v) => !v)}
            >
              <h1 className="text-2xl font-black tracking-tighter text-[var(--color-charcoal)]">{repo.name}</h1>
              <ChevronDown size={18} className="mt-0.5 text-[var(--color-charcoal)]" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[color:rgba(0,0,0,0.06)]"
          >
            <Settings size={16} className="text-[color:rgba(26,24,22,0.5)]" />
          </button>
        </div>
        {showRepoDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-[color:rgba(26,24,22,0.08)] bg-white shadow-lg"
          >
            {REPOS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold ${
                  r.id === repo.id
                    ? "bg-[var(--color-faint)] text-[var(--color-charcoal)]"
                    : "text-[color:rgba(26,24,22,0.6)] hover:bg-[var(--color-faint)]"
                }`}
                onClick={() => {
                  onRepoChange(r.id);
                  setShowRepoDropdown(false);
                }}
              >
                {r.name}
                {r.id === repo.id && <Check size={14} className="ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {missingCount > 0 && (
        <div className="shrink-0 px-6 pt-1">
          <p className="text-sm font-medium text-[color:rgba(26,24,22,0.5)]">
            {missingCount} teammate{missingCount > 1 ? "s haven't" : " hasn't"} posted yet.
          </p>
        </div>
      )}

      {/* Story bubble row */}
      <div className="hide-scrollbar shrink-0 overflow-x-auto px-5 pt-5 pb-4">
        <div className="flex gap-4">
          {repo.me && (
            <StoryBubble member={repo.me} isMe postState={bubblePostState} hasRelevant={false} onClick={handleBubbleTap} />
          )}
          {[...repo.team]
            .map((member) => {
              const memberStories = repo.stories.filter(s => s.authorId === member.id && s.aiTag !== "small");
              const allRead = memberStories.length > 0 && memberStories.every(s => readStories.includes(s.id));
              const noStories = memberStories.length === 0;
              const effectiveMember = (allRead || noStories) && member.status === "unread" ? { ...member, status: noStories ? "missing" : "read" } : member;
              const hasRelevant = memberStories.some(s => s.relevant && !readStories.includes(s.id));
              return { member: effectiveMember, hasRelevant, allRead };
            })
            .sort((a, b) => {
              if (a.allRead !== b.allRead) return a.allRead - b.allRead;
              if (a.hasRelevant !== b.hasRelevant) return b.hasRelevant - a.hasRelevant;
              return 0;
            })
            .map(({ member, hasRelevant }) => (
              <StoryBubble key={member.id} member={member} isMe={false} postState="empty" hasRelevant={hasRelevant} onClick={handleBubbleTap} />
            ))}
        </div>
      </div>

      <div className="mx-5 mb-4 border-t border-[color:rgba(26,24,22,0.06)]" />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {repo.me ? (
          <>
            {pendingPost && (
              <PendingPostCard
                post={pendingPost}
                secondsRemaining={secondsRemaining}
                cancelled={false}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onPostNow={handlePostNow}
              />
            )}
            {!pendingPost && !hasPosted && (
              <EmptyPostCard onPost={handlePost} />
            )}
            {(repo.pendingPosts || []).length > 0 && (
              <RecentDiffsFeed
                posts={feedPosts}
                postStatuses={postStatuses}
                onPost={handleFeedPost}
                onDismiss={handleFeedDismiss}
                onRetract={handleFeedRetract}
                onEdit={handleFeedEdit}
              />
            )}
            <AnimatePresence>
              {undoAction && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="sticky bottom-4 mx-5 mt-4"
                >
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--color-charcoal)] px-5 py-3 shadow-lg">
                    <span className="text-sm font-semibold text-white">{undoAction.label}</span>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleUndo} className="rounded-lg px-3 py-1 text-sm font-bold text-[var(--color-coral)]">
                      Undo
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex flex-col items-center px-5 pt-8">
            <p className="text-sm font-medium text-[color:rgba(26,24,22,0.4)]">
              Tap a teammate to view their updates
            </p>
          </div>
        )}
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute inset-0 z-50 flex flex-col bg-[var(--color-app-bg)]"
          >
            <div className="flex shrink-0 items-center justify-between px-5 pt-14 pb-4">
              <h2 className="text-xl font-black tracking-tight text-[var(--color-charcoal)]">Settings</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:rgba(0,0,0,0.08)]"
              >
                <X size={16} strokeWidth={2.5} className="text-black/60" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              <div className="mb-6">
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[color:rgba(26,24,22,0.4)]">
                  Who are you?
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { onSetMe(null); setShowSettings(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${
                      currentMeId === null
                        ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                        : "border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-[var(--color-charcoal)]"
                    }`}
                  >
                    <span className="text-sm font-bold">Nobody (observer)</span>
                    {currentMeId === null && <Check size={14} className="ml-auto" />}
                  </button>
                  {allMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { onSetMe(m.id); setShowSettings(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${
                        currentMeId === m.id
                          ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                          : "border-[color:rgba(26,24,22,0.08)] bg-[color:rgba(255,255,255,0.6)] text-[var(--color-charcoal)]"
                      }`}
                    >
                      <img src={m.avatar} alt={m.name} className="h-8 w-8 rounded-full bg-[var(--color-faint)] object-cover" />
                      <span className="text-sm font-bold">{m.name}</span>
                      {currentMeId === m.id && <Check size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[color:rgba(26,24,22,0.06)] pt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onResetData(); setShowSettings(false); }}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-[var(--color-danger)] py-[14px] text-sm font-bold text-[var(--color-danger)]"
                >
                  <Trash2 size={14} /> Reset All Local Data
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
