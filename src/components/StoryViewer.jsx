import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitPullRequest, GitMerge, Lock, MessageCircle, Flame, Eye, Hand, CircleAlert } from "lucide-react";
import { STORIES } from "../data";

const AUTO_ADVANCE_DELAY = 8000;
const FLOAT_LIFETIME = 1300;
const CUBE_TRANSITION = "transform 0.4s cubic-bezier(.4,.0,.2,1)";

const PR_STATUS_CONFIG = {
  MERGED: {
    icon: GitMerge,
    iconClass: "text-[var(--color-sage)]",
    badgeClass: "bg-[var(--color-sage)] text-white",
    label: "Merged",
  },
  OPEN: {
    icon: GitPullRequest,
    iconClass: "text-[var(--color-charcoal)]",
    badgeClass: "bg-[var(--color-warning)] text-white",
    label: "Review",
  },
  DRAFT: {
    icon: Lock,
    iconClass: "text-[color:rgba(26,24,22,0.55)]",
    badgeClass: "bg-[var(--color-faint)] text-[color:rgba(26,24,22,0.7)]",
    label: "Draft",
  },
};

const TICKET_STATUS_CONFIG = {
  "IN REVIEW": { badgeClass: "bg-[var(--color-warning)] text-white", label: "In Review" },
  BLOCKED: { badgeClass: "bg-[var(--color-danger)] text-white", label: "Blocked" },
  DONE: { badgeClass: "bg-[var(--color-sage)] text-white", label: "Done" },
};

const REACTION_CONFIG = {
  fire: { icon: Flame, floatIcon: Flame, accent: "text-[var(--color-danger)]" },
  eyes: { icon: Eye, floatIcon: Eye, accent: "text-[var(--color-charcoal)]" },
  hand: { icon: Hand, floatIcon: Hand, accent: "text-[var(--color-charcoal)]" },
};

function AttachedCardStatic({ story }) {
  if (story.pr) {
    const config = PR_STATUS_CONFIG[story.pr.status] || PR_STATUS_CONFIG.OPEN;
    const Icon = config.icon;
    return (
      <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-[color:rgba(209,210,208,0.8)] px-4 py-3 text-left shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={16} className={config.iconClass} />
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black/40">{story.pr.number}</span>
            <span className={`${config.badgeClass} rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide`}>{config.label}</span>
          </div>
          <p className="font-mono text-sm font-semibold tracking-tight text-[var(--color-charcoal)]">{story.pr.title}</p>
        </div>
      </div>
    );
  }
  if (story.ticket) {
    const config = TICKET_STATUS_CONFIG[story.ticket.status] || TICKET_STATUS_CONFIG["IN REVIEW"];
    return (
      <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-[color:rgba(209,210,208,0.8)] px-4 py-3 text-left shadow-sm">
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className={`${config.badgeClass} rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide`}>{config.label}</span>
          </div>
          <p className="text-sm font-semibold tracking-tight text-[var(--color-charcoal)]">{story.ticket.title}</p>
        </div>
      </div>
    );
  }
  return null;
}

function AttachedCard({ story }) {
  if (story.pr) {
    const config = PR_STATUS_CONFIG[story.pr.status] || PR_STATUS_CONFIG.OPEN;
    const Icon = config.icon;
    return (
      <motion.a
        href={story.pr.url}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.38, ease: "easeOut" }}
        className="pointer-events-auto mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-[color:rgba(209,210,208,0.8)] px-4 py-3 text-left shadow-sm"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={16} className={config.iconClass} />
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black/40">{story.pr.number}</span>
            <span className={`${config.badgeClass} rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide`}>{config.label}</span>
          </div>
          <p className="font-mono text-sm font-semibold tracking-tight text-[var(--color-charcoal)]">{story.pr.title}</p>
        </div>
      </motion.a>
    );
  }
  if (story.ticket) {
    const config = TICKET_STATUS_CONFIG[story.ticket.status] || TICKET_STATUS_CONFIG["IN REVIEW"];
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.38, ease: "easeOut" }}
        className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-[color:rgba(209,210,208,0.8)] px-4 py-3 text-left shadow-sm"
      >
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className={`${config.badgeClass} rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide`}>{config.label}</span>
          </div>
          <p className="text-sm font-semibold tracking-tight text-[var(--color-charcoal)]">{story.ticket.title}</p>
        </div>
      </motion.button>
    );
  }
  return null;
}

function FloatingReaction({ reaction }) {
  const Icon = reaction.Icon;
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.6, x: reaction.offsetX }}
      animate={{ opacity: 0, y: -150, scale: 1.45, x: reaction.offsetX + 8 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-44 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/75 shadow-md backdrop-blur-md"
    >
      <Icon size={20} className={reaction.className} />
    </motion.div>
  );
}

function ReactionButton({ type, count, onPress }) {
  const config = REACTION_CONFIG[type];
  const Icon = config.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onPress}
      className="pointer-events-auto flex h-14 w-14 flex-col items-center justify-center rounded-full border border-white/50 bg-white/60 shadow-md backdrop-blur-md"
      aria-label={`React with ${type}`}
    >
      <Icon size={19} className={config.accent} />
      {count > 0 && <span className="mt-0.5 text-[10px] font-bold leading-none text-black/50">{count}</span>}
    </motion.button>
  );
}

function CubeFace({ story, storyIndex }) {
  return (
    <div className="absolute inset-0 bg-[var(--color-app-bg)]">
      <div className="absolute inset-x-0 top-0 px-4 pt-12">
        <div className="mb-4 flex gap-1.5">
          {STORIES.map((s, i) => (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/10">
              {i < storyIndex && <div className="h-full w-full bg-[var(--color-charcoal)]" />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-black/5 shadow-sm">
            <img src={story.avatar} alt={story.author} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-[var(--color-charcoal)]">{story.author}</p>
            <p className="mt-0.5 text-xs font-medium text-black/40">{story.role} · {story.time}</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-center px-6">
        <h1 className="text-[2.5rem] font-black leading-[1.06] tracking-tighter text-[var(--color-charcoal)]">
          {story.text}
        </h1>
        <p className="mt-3 text-xs font-medium text-[color:rgba(26,24,22,0.3)]">
          Summarized by Minimax M2.7
        </p>
        <AttachedCardStatic story={story} />
      </div>
    </div>
  );
}

export default function StoryViewer({ startIndex = 0, onClose }) {
  const safeStartIndex = Math.max(0, Math.min(startIndex, STORIES.length - 1));
  const [activeIndex, setActiveIndex] = useState(safeStartIndex);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState(
    STORIES.reduce((accumulator, story) => ({
      ...accumulator,
      [story.id]: { ...story.reactions },
    }), {})
  );
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [replySent, setReplySent] = useState(false);
  const [cubeAngle, setCubeAngle] = useState(0);
  const [dismissY, setDismissY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(400);
  const progressTimerRef = useRef(null);
  const touchRef = useRef(null);
  const swipedRef = useRef(false);
  const containerRef = useRef(null);
  const skipTransitionRef = useRef(false);
  const currentStory = STORIES[activeIndex];

  useEffect(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
  }, []);

  useEffect(() => {
    setActiveIndex(safeStartIndex);
    setProgressKey((value) => value + 1);
  }, [safeStartIndex]);

  const counts = useMemo(() => reactionCounts[currentStory.id] || {}, [reactionCounts, currentStory.id]);

  const goNext = useCallback(() => {
    setActiveIndex((previous) => {
      if (previous < STORIES.length - 1) return previous + 1;
      onClose?.();
      return previous;
    });
    setShowReplyInput(false);
    setReplySent(false);
    setProgressKey((value) => value + 1);
  }, [onClose]);

  const goPrev = useCallback(() => {
    setActiveIndex((previous) => Math.max(0, previous - 1));
    setShowReplyInput(false);
    setReplySent(false);
    setProgressKey((value) => value + 1);
  }, []);

  useEffect(() => {
    clearTimeout(progressTimerRef.current);
    if (showReplyInput || isAnimating) return undefined;
    progressTimerRef.current = setTimeout(goNext, AUTO_ADVANCE_DELAY);
    return () => clearTimeout(progressTimerRef.current);
  }, [activeIndex, showReplyInput, isAnimating, goNext]);

  useEffect(() => {
    const handleKey = (event) => {
      if (isAnimating) return;
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose, isAnimating]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const width = element.offsetWidth || 400;

    const onPointerDown = (event) => {
      if (isAnimating) return;
      touchRef.current = { x: event.clientX, y: event.clientY, axis: null, swiping: false };
    };

    const onPointerMove = (event) => {
      const t = touchRef.current;
      if (!t || isAnimating) return;
      const dx = event.clientX - t.x;
      const dy = event.clientY - t.y;

      if (!t.axis) {
        if (Math.abs(dx) > 12) t.axis = "x";
        else if (dy > 12) t.axis = "y";
        else return;
        t.swiping = true;
        setIsDragging(true);
      }

      if (t.axis === "x") {
        // Drag right (dx>0) → positive angle → cube rotates left → reveals left face (prev)
        // Drag left (dx<0) → negative angle → cube rotates right → reveals right face (next)
        const goingPrev = dx > 0;
        const goingNext = dx < 0;
        const hasAdjacent = goingPrev ? activeIndex > 0 : goingNext ? activeIndex < STORIES.length - 1 : false;
        const maxAngle = hasAdjacent ? 90 : 10;
        const angle = Math.max(-maxAngle, Math.min(maxAngle, (dx / width) * 90));
        setCubeAngle(angle);
      } else if (t.axis === "y") {
        setDismissY(Math.max(0, dy));
      }
    };

    const onPointerUp = (event) => {
      const t = touchRef.current;
      if (!t) return;
      const wasSwiping = t.swiping;
      const axis = t.axis;
      const dx = event.clientX - t.x;
      const dy = event.clientY - t.y;
      touchRef.current = null;

      if (!wasSwiping) {
        setIsDragging(false);
        return;
      }

      swipedRef.current = true;
      setTimeout(() => { swipedRef.current = false; }, 50);

      if (axis === "y") {
        if (dy > 100) onClose?.();
        setDismissY(0);
        setIsDragging(false);
        return;
      }

      if (axis === "x") {
        const angle = (dx / width) * 90;
        const goingPrev = angle > 0;
        const goingNext = angle < 0;
        const hasAdjacent = goingPrev ? activeIndex > 0 : goingNext ? activeIndex < STORIES.length - 1 : false;

        if (Math.abs(angle) > 20 && hasAdjacent) {
          setIsAnimating(true);
          setCubeAngle(goingNext ? -90 : 90);

          setTimeout(() => {
            skipTransitionRef.current = true;
            setActiveIndex((previous) => goingNext ? previous + 1 : previous - 1);
            setCubeAngle(0);
            setIsAnimating(false);
            setIsDragging(false);
            setShowReplyInput(false);
            setReplySent(false);
            setProgressKey((value) => value + 1);
            requestAnimationFrame(() => { skipTransitionRef.current = false; });
          }, 400);
        } else {
          setCubeAngle(0);
          setIsDragging(false);
        }
      }
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
    };
  }, [activeIndex, isAnimating, onClose]);

  const addReaction = (type) => {
    const config = REACTION_CONFIG[type];
    const id = Date.now();
    const offsetX = Math.random() * 16 - 8;
    setFloatingReactions((previous) => [
      ...previous,
      { id, offsetX, Icon: config.floatIcon, className: config.accent },
    ]);
    setReactionCounts((previous) => ({
      ...previous,
      [currentStory.id]: {
        ...previous[currentStory.id],
        [type]: (previous[currentStory.id][type] || 0) + 1,
      },
    }));
    setTimeout(() => {
      setFloatingReactions((previous) => previous.filter((reaction) => reaction.id !== id));
    }, FLOAT_LIFETIME);
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    setReplyText("");
    setShowReplyInput(false);
    setReplySent(true);
    setTimeout(() => setReplySent(false), 1600);
  };

  // Cube faces
  const half = containerWidth / 2;
  const prevStory = activeIndex > 0 ? STORIES[activeIndex - 1] : null;
  const nextStory = activeIndex < STORIES.length - 1 ? STORIES[activeIndex + 1] : null;
  const showSideFaces = isDragging || isAnimating;
  const cubeTransition = skipTransitionRef.current ? "none" : isDragging ? "none" : CUBE_TRANSITION;

  // Dismiss style (swipe down)
  const dismissActive = isDragging && dismissY > 0;
  const outerStyle = dismissActive ? {
    transform: `translateY(${dismissY * 0.4}px) scale(${1 - dismissY * 0.0004})`,
    opacity: 1 - dismissY * 0.003,
    transition: "none",
    borderRadius: "20px",
  } : (!isDragging && dismissY === 0) ? {
    transition: "transform 0.3s ease, opacity 0.3s ease",
  } : undefined;

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute inset-0 z-50 overflow-hidden bg-[var(--color-app-bg)] will-change-transform"
      style={outerStyle}
    >
      {/* 3D cube container */}
      <div style={{ perspective: `${containerWidth * 2}px` }} className="absolute inset-0">
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-${half}px) rotateY(${cubeAngle}deg)`,
            transition: cubeTransition,
          }}
        >
          {/* FRONT face — current story (interactive) */}
          <div
            className="absolute inset-0 bg-[var(--color-app-bg)]"
            style={{
              transform: `translateZ(${half}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Tap zones */}
            <div className="absolute inset-y-0 left-0 z-20 w-1/3" onClick={(event) => { event.stopPropagation(); if (!swipedRef.current && !isAnimating) goPrev(); }} />
            <div className="absolute inset-y-0 right-0 z-20 w-2/3" onClick={(event) => { event.stopPropagation(); if (!swipedRef.current && !isAnimating && !showReplyInput) goNext(); }} />

            {/* Progress + header */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-12">
              <div className="mb-4 flex gap-1.5">
                {STORIES.map((story, index) => (
                  <div key={story.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/10">
                    {index < activeIndex && <div className="h-full w-full bg-[var(--color-charcoal)]" />}
                    {index === activeIndex && (
                      <motion.div
                        key={progressKey}
                        className="h-full bg-[var(--color-charcoal)]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: AUTO_ADVANCE_DELAY / 1000, ease: "linear" }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="pointer-events-auto flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStory.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-black/5 shadow-sm">
                      <img src={currentStory.avatar} alt={currentStory.author} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none text-[var(--color-charcoal)]">{currentStory.author}</p>
                      <p className="mt-0.5 text-xs font-medium text-black/40">
                        {currentStory.role} · {currentStory.time}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/8 pointer-events-auto">
                  <X size={16} strokeWidth={2.5} className="text-black/60" />
                </motion.button>
              </div>
            </div>

            {/* Story content */}
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-6">
              <AnimatePresence mode="popLayout">
                <motion.div key={currentStory.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <h1 className="text-[2.5rem] font-black leading-[1.06] tracking-tighter text-[var(--color-charcoal)]">
                    {currentStory.text}
                  </h1>
                  <p className="mt-3 text-xs font-medium text-[color:rgba(26,24,22,0.3)]">
                    Summarized by Minimax M2.7
                  </p>
                  <AttachedCard story={currentStory} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating reactions */}
            <AnimatePresence>
              {floatingReactions.map((reaction) => (
                <FloatingReaction key={reaction.id} reaction={reaction} />
              ))}
            </AnimatePresence>

            {/* Comment bar */}
            <div className="pointer-events-auto absolute right-4 left-4 bottom-[max(2rem,env(safe-area-inset-bottom))] z-30">
              <AnimatePresence mode="wait">
                {showReplyInput ? (
                  <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                    <input
                      autoFocus
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleReplySubmit();
                        if (event.key === "Escape") setShowReplyInput(false);
                      }}
                      placeholder={`Reply to ${currentStory.author.split(" ")[0]}...`}
                      className="h-14 flex-1 rounded-full border border-white/50 bg-white/70 px-5 text-base font-medium text-[var(--color-charcoal)] shadow-md backdrop-blur-md placeholder:text-black/30"
                    />
                    <motion.button whileTap={{ scale: 0.92 }} onClick={handleReplySubmit} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)]">
                      <MessageCircle size={18} className="text-white" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowReplyInput(true);
                        clearTimeout(progressTimerRef.current);
                      }}
                      className="flex h-14 flex-1 items-center rounded-full border border-white/50 bg-white/40 px-5 text-left text-sm font-medium text-black/40 shadow-sm backdrop-blur-md"
                    >
                      {replySent ? "Comment sent" : "Comment..."}
                    </motion.button>
                    <ReactionButton type="fire" count={counts.fire || 0} onPress={(event) => { event.stopPropagation(); addReaction("fire"); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {replySent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-6 bottom-28 z-30 inline-flex items-center gap-2 rounded-full bg-[var(--color-charcoal)] px-3 py-2 text-xs font-semibold text-white shadow-md"
              >
                <CircleAlert size={14} />
                Reply sent
              </motion.div>
            )}
          </div>

          {/* LEFT face — previous story */}
          {prevStory && showSideFaces && (
            <div
              className="absolute inset-0"
              style={{
                transform: `rotateY(-90deg) translateZ(${half}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <CubeFace story={prevStory} storyIndex={activeIndex - 1} />
            </div>
          )}

          {/* RIGHT face — next story */}
          {nextStory && showSideFaces && (
            <div
              className="absolute inset-0"
              style={{
                transform: `rotateY(90deg) translateZ(${half}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <CubeFace story={nextStory} storyIndex={activeIndex + 1} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
