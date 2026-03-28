import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Plus, Pencil, X, Send, Undo2, ChevronDown, FileEdit, Trash2, HelpCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { REPOS } from "../data";

const TICKET_STATUS_CONFIG = {
  MERGED: { badgeClass: "bg-[var(--color-sage)] text-white", label: "Merged" },
  "IN REVIEW": { badgeClass: "bg-[var(--color-warning)] text-white", label: "In Review" },
  BLOCKED: { badgeClass: "bg-[var(--color-danger)] text-white", label: "Blocked" },
  DONE: { badgeClass: "bg-[var(--color-sage)] text-white", label: "Done" },
  OPEN: { badgeClass: "bg-[var(--color-warning)] text-white", label: "Open" },
};

function StoryBubble({ member, isMe, postState, onClick }) {
  const isUnread = member.status === "unread";
  const isMissing = member.status === "missing";
  const isRead = member.status === "read" || member.status === "posted";

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
            className="absolute inset-0 rounded-full border-[3px] border-[var(--color-coral)]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div
          className={`absolute inset-0 rounded-full border-[3px] ${
            isUnread && !isMe
              ? "border-[var(--color-coral)]"
              : isMissing
                ? "border-dashed border-[color:rgba(26,24,22,0.2)]"
                : "border-[color:rgba(26,24,22,0.1)]"
          }`}
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
          <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[var(--color-app-bg)] bg-[var(--color-coral)]" />
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
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]">{post.text}</p>
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
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]">{post.text}</p>
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
        <p className="text-base font-semibold leading-snug text-[var(--color-charcoal)]">{post.text}</p>
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

export default function TeamConstellation({ repo, onRepoChange, onMemberTap, onEditPost }) {
  const initialPostState = repo.pendingPost ? "pending" : repo.me ? "posted" : "empty";
  const [postState, setPostState] = useState(initialPostState);
  const [pendingPost, setPendingPost] = useState(repo.pendingPost);
  const [postedPost, setPostedPost] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    repo.pendingPost ? Math.max(0, Math.round((repo.pendingPost.autoPostAt - Date.now()) / 1000)) : 0
  );
  const [pendingCancelled, setPendingCancelled] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  // Reset state when repo changes
  useEffect(() => {
    const newPostState = repo.pendingPost ? "pending" : repo.me ? "posted" : "empty";
    setPostState(newPostState);
    setPendingPost(repo.pendingPost);
    setPostedPost(null);
    setPendingCancelled(false);
    setSecondsRemaining(
      repo.pendingPost ? Math.max(0, Math.round((repo.pendingPost.autoPostAt - Date.now()) / 1000)) : 0
    );
  }, [repo.id]);

  const missingCount = repo.team.filter((m) => m.status === "missing").length;

  useEffect(() => {
    if (postState !== "pending" || pendingCancelled) return;
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setPostState("posted");
          setPostedPost(pendingPost);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [postState, pendingPost, pendingCancelled]);

  const handleBubbleTap = (member) => {
    if (member.id === 0) {
      if (postState === "empty") {
        onEditPost?.(null);
      }
      return;
    }
    onMemberTap(member);
  };

  const handleEdit = () => {
    onEditPost?.({
      text: pendingPost.text,
      attachType: pendingPost.ticket ? "ticket" : pendingPost.pr ? "pr" : null,
      ticketTitle: pendingPost.ticket?.title || "",
      ticketStatus: pendingPost.ticket?.status || "IN REVIEW",
    });
  };

  const handleCancel = () => {
    setPendingCancelled(true);
  };


  const handlePostNow = () => {
    setPostState("posted");
    setPostedPost(pendingPost);
  };

  const handleRetract = () => {
    setPostState("draft");
  };

  const handleDiscard = () => {
    setPostState("empty");
    setPostedPost(null);
  };

  const handleRepost = () => {
    setPostState("posted");
  };

  const handleDraftEdit = () => {
    const post = postedPost;
    onEditPost?.({
      text: post.text,
      attachType: post.ticket ? "ticket" : post.pr ? "pr" : null,
      ticketTitle: post.ticket?.title || "",
      ticketStatus: post.ticket?.status || "IN REVIEW",
    });
  };

  const handlePost = () => {
    onEditPost?.(null);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--color-app-bg)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-12 pb-2">
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
            <StoryBubble member={repo.me} isMe postState={postState} onClick={handleBubbleTap} />
          )}
          {repo.team.map((member) => (
            <StoryBubble key={member.id} member={member} isMe={false} postState="empty" onClick={handleBubbleTap} />
          ))}
        </div>
      </div>

      <div className="mx-5 mb-4 border-t border-[color:rgba(26,24,22,0.06)]" />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {repo.me ? (
          <>
            {postState === "pending" && pendingPost && (
              <PendingPostCard
                post={pendingPost}
                secondsRemaining={secondsRemaining}
                cancelled={pendingCancelled}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onPostNow={handlePostNow}
              />
            )}
            {postState === "posted" && postedPost && (
              <PostedCard post={postedPost} onRetract={handleRetract} />
            )}
            {postState === "draft" && postedPost && (
              <DraftPostCard
                post={postedPost}
                onEdit={handleDraftEdit}
                onDiscard={handleDiscard}
                onRepost={handleRepost}
              />
            )}
            {postState === "empty" && (
              <EmptyPostCard onPost={handlePost} />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center px-5 pt-8">
            <p className="text-sm font-medium text-[color:rgba(26,24,22,0.4)]">
              Tap a teammate to view their updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
