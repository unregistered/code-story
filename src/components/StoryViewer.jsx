import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitPullRequest, GitMerge, Lock, MessageCircle, Flame, Eye, Hand, CircleAlert, Sparkles, Target, Pointer, FileText, Bug, Settings, Bell, Calendar, User } from "lucide-react";

const AUTO_ADVANCE_DELAY = 8000;
const FLOAT_LIFETIME = 1300;
const CUBE_TRANSITION = "transform 1s cubic-bezier(.25,.1,.25,1)";

function formatTimeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(diff / 86400000);
  return `${days}d ago`;
}

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

const ONBOARDING_ILLUSTRATIONS = {
  // Slide 1: Two rows of people, slump one by one — boredom
  "onb-1": () => {
    const delays = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
    const slumpDelays = [0.6, 1.0, 0.8, 1.4, 1.1, 0.7, 1.6, 0.9, 1.3, 1.2];
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ height: 140 }}>
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center justify-center gap-4">
            {[0, 1, 2, 3, 4].map((col) => {
              const i = row * 5 + col;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: [0, 0.5, 0.5, 0.2, 0.2], rotate: [0, 0, 0, 15, 15] }}
                  transition={{
                    delay: delays[i],
                    duration: 3.5,
                    times: [0, 0.06, slumpDelays[i] / 3.5, Math.min((slumpDelays[i] + 0.3) / 3.5, 0.95), 1],
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  style={{ originX: 0.5, originY: 1 }}
                >
                  <User size={28} strokeWidth={1.5} className="text-[var(--color-charcoal)]" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
  // Slide 2: Typewriter — three bars write in left-to-right, then sparkle pops
  "onb-2": () => (
    <div className="flex items-center justify-center" style={{ height: 120 }}>
      <div className="flex flex-col gap-2.5" style={{ width: 140 }}>
        {[
          { width: "100%", delay: 0 },
          { width: "78%", delay: 0.3 },
          { width: "52%", delay: 0.6 },
        ].map((bar, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-[var(--color-charcoal)]"
            style={{ width: bar.width, transformOrigin: "left" }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 0.3, 0.3, 0], scaleX: [0, 1, 1, 1] }}
            transition={{
              delay: bar.delay,
              duration: 3.5,
              times: [0, 0.1, 0.75, 0.9],
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0], scale: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0.8], x: [0, 0, -4, 3, -2, 4, -3, 1, 0, 0], y: [0, 0, 3, -4, 3, -2, -3, 2, 0, 0] }}
          transition={{
            delay: 1,
            duration: 3.5,
            times: [0, 0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.20, 0.22, 0.85],
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        >
          <Sparkles size={32} strokeWidth={1.5} className="text-[var(--color-warning)]" />
        </motion.div>
      </div>
    </div>
  ),
  // Slide 3: Busy icon grid — 3 highlight in purple, rest fade out
  "onb-3": () => {
    const icons = [
      { Icon: GitPullRequest, highlight: true },
      { Icon: FileText, highlight: false },
      { Icon: Bug, highlight: false },
      { Icon: MessageCircle, highlight: true },
      { Icon: Settings, highlight: false },
      { Icon: Bell, highlight: false },
      { Icon: Flame, highlight: false },
      { Icon: GitMerge, highlight: true },
      { Icon: Calendar, highlight: false },
    ];
    return (
      <div className="flex flex-wrap items-center justify-center gap-3" style={{ height: 120, maxWidth: 200, margin: "0 auto" }}>
        {icons.map(({ Icon, highlight }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: highlight ? [0, 0.45, 0.45, 0.7, 0.7] : [0, 0.45, 0.45, 0.1, 0.1],
              scale: highlight ? [0.5, 1, 1, 1.15, 1.1] : [0.5, 1, 1, 0.85, 0.85],
            }}
            transition={{ delay: i * 0.06, duration: 3, times: [0, 0.15, 0.4, 0.55, 1], repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              className={highlight ? "text-[var(--color-relevant)]" : "text-[var(--color-charcoal)]"}
            />
          </motion.div>
        ))}
      </div>
    );
  },
  // Slide 4: Single tap icon with a press bounce
  "onb-4": () => (
    <div className="flex items-center justify-center" style={{ height: 120 }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 0.55, y: 0, scale: [1, 1, 0.9, 1, 1] }}
        transition={{ duration: 2, times: [0, 0.4, 0.5, 0.6, 1], repeat: Infinity, repeatDelay: 1 }}
      >
        <Pointer size={48} strokeWidth={1.5} className="text-[var(--color-charcoal)]" />
      </motion.div>
    </div>
  ),
};

function OnboardingIllustration({ storyId }) {
  const Illustration = ONBOARDING_ILLUSTRATIONS[storyId];
  if (!Illustration) return null;
  return (
    <div className="mb-5">
      <Illustration />
    </div>
  );
}

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

function CubeFace({ story, stories, storyIndex }) {
  return (
    <div className="absolute inset-0 bg-[var(--color-app-bg)]">
      <div className="absolute inset-x-0 top-0 px-4 pt-12">
        <div className="mb-4 flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className={`h-[3px] flex-1 overflow-hidden rounded-full ${s.relevant ? "bg-[color:rgba(168,85,247,0.3)]" : "bg-black/10"}`}>
              {i < storyIndex && <div className={`h-full w-full ${s.relevant ? "bg-[var(--color-relevant)]" : "bg-[var(--color-charcoal)]"}`} />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-black/5 shadow-sm">
            <img src={story.avatar} alt={story.author} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-[var(--color-charcoal)]">{story.author}</p>
            <p className="mt-0.5 text-xs font-medium text-black/40">{story.role} · {formatTimeAgo(story.time)}</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-center px-6 pb-16">
        <h1 className="text-[2.5rem] font-black leading-[1.06] tracking-tighter text-[var(--color-charcoal)]">
          {story.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <span key={i}>{part.slice(2, -2)}</span>
              : <span key={i} className="font-medium opacity-45">{part}</span>
          )}
        </h1>
        <p className="mt-3 text-xs font-medium text-[color:rgba(26,24,22,0.3)]">
          Summarized by Minimax M2.7
        </p>
        <AttachedCardStatic story={story} />
      </div>
    </div>
  );
}

export default function StoryViewer({ stories, startAuthorId, readStories = [], onClose, onView, onboarding = false }) {
  // Group stories by author, preserving first-appearance order
  const storyGroups = useMemo(() => {
    const groups = [];
    const seen = new Set();
    for (const story of stories) {
      if (!seen.has(story.authorId)) {
        seen.add(story.authorId);
        // Reverse so oldest is first (tap through chronologically)
        groups.push(stories.filter(s => s.authorId === story.authorId).reverse());
      }
    }
    return groups;
  }, [stories]);

  const initialPersonIndex = useMemo(() => {
    const idx = storyGroups.findIndex(g => g[0].authorId === startAuthorId);
    return idx >= 0 ? idx : 0;
  }, [storyGroups, startAuthorId]);

  const initialStoryIndex = useMemo(() => {
    const group = storyGroups[initialPersonIndex];
    if (!group) return 0;
    const firstUnread = group.findIndex(s => !readStories.includes(s.id));
    return firstUnread >= 0 ? firstUnread : 0;
  }, [storyGroups, initialPersonIndex, readStories]);

  const readSet = useMemo(() => new Set(readStories), [readStories]);

  const firstUnreadIn = useCallback((group) => {
    const idx = group.findIndex(s => !readSet.has(s.id));
    return idx >= 0 ? idx : 0;
  }, [readSet]);

  const [personIndex, setPersonIndex] = useState(initialPersonIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState(
    stories.reduce((accumulator, story) => ({
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
  const skipTransitionRef = useRef(true);

  const currentGroup = storyGroups[personIndex];
  const currentStory = currentGroup[storyIndex];

  useEffect(() => {
    onView?.(currentStory.id);
  }, [personIndex, storyIndex]);

  useEffect(() => {
    if (containerRef.current) {
      skipTransitionRef.current = true;
      setContainerWidth(containerRef.current.offsetWidth);
      requestAnimationFrame(() => { skipTransitionRef.current = false; });
    }
  }, []);

  const counts = useMemo(() => reactionCounts[currentStory.id] || {}, [reactionCounts, currentStory.id]);

  // Tap right / auto-advance: within person, then next person, then close
  const goNext = useCallback(() => {
    if (storyIndex < currentGroup.length - 1) {
      setStoryIndex(s => s + 1);
    } else if (personIndex < storyGroups.length - 1) {
      const nextGroup = storyGroups[personIndex + 1];
      setPersonIndex(p => p + 1);
      setStoryIndex(firstUnreadIn(nextGroup));
    } else {
      onClose?.();
      return;
    }
    setShowReplyInput(false);
    setReplySent(false);
    setProgressKey(v => v + 1);
  }, [storyIndex, currentGroup.length, personIndex, storyGroups.length, onClose]);

  // Tap left: within person, then prev person's last story
  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(s => s - 1);
    } else if (personIndex > 0) {
      const prevGroup = storyGroups[personIndex - 1];
      setPersonIndex(p => p - 1);
      setStoryIndex(prevGroup.length - 1);
    } else {
      return;
    }
    setShowReplyInput(false);
    setReplySent(false);
    setProgressKey(v => v + 1);
  }, [storyIndex, personIndex, storyGroups]);

  // Auto-advance timer
  useEffect(() => {
    clearTimeout(progressTimerRef.current);
    if (showReplyInput || isAnimating) return undefined;
    progressTimerRef.current = setTimeout(goNext, AUTO_ADVANCE_DELAY);
    return () => clearTimeout(progressTimerRef.current);
  }, [personIndex, storyIndex, showReplyInput, isAnimating, goNext]);

  // Keyboard arrows = tap equivalent (within person, overflow to next person)
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

  // Swipe/drag handler — x-axis swipes between people
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
        const goingPrev = dx > 0;
        const goingNext = dx < 0;
        const hasAdjacent = goingPrev ? personIndex > 0 : goingNext ? personIndex < storyGroups.length - 1 : false;
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
        const hasAdjacent = goingPrev ? personIndex > 0 : goingNext ? personIndex < storyGroups.length - 1 : false;

        if (Math.abs(angle) > 20 && hasAdjacent) {
          setIsAnimating(true);
          setCubeAngle(goingNext ? -90 : 90);

          const remaining = (90 - Math.abs(angle)) / 90;
          const duration = Math.max(250, remaining * 1000);
          setTimeout(() => {
            skipTransitionRef.current = true;
            const nextIdx = goingNext ? personIndex + 1 : personIndex - 1;
            setPersonIndex(nextIdx);
            setStoryIndex(firstUnreadIn(storyGroups[nextIdx]));
            setCubeAngle(0);
            setIsAnimating(false);
            setIsDragging(false);
            setShowReplyInput(false);
            setReplySent(false);
            setProgressKey(v => v + 1);
            requestAnimationFrame(() => { skipTransitionRef.current = false; });
          }, duration);
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
  }, [personIndex, storyGroups.length, isAnimating, onClose]);

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
  const prevPersonGroup = personIndex > 0 ? storyGroups[personIndex - 1] : null;
  const nextPersonGroup = personIndex < storyGroups.length - 1 ? storyGroups[personIndex + 1] : null;
  const showSideFaces = isDragging || isAnimating;
  const cubeTransition = skipTransitionRef.current || isDragging ? "none" : isAnimating ? CUBE_TRANSITION : "none";

  // Dismiss style (swipe down)
  const dismissActive = isDragging && dismissY > 0;
  const outerStyle = dismissActive ? {
    transform: `translateY(${dismissY * 0.4}px) scale(${1 - dismissY * 0.0004})`,
    opacity: 1 - dismissY * 0.003,
    transition: "none",
    borderRadius: "20px",
  } : undefined;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 overflow-hidden bg-[var(--color-app-bg)]"
      style={outerStyle}
    >
      {/* Tap zones */}
      <div className="absolute inset-0 z-20">
        <div className="absolute inset-y-0 left-0 w-1/3" onClick={(event) => { event.stopPropagation(); if (!swipedRef.current && !isAnimating) goPrev(); }} />
        <div className="absolute inset-y-0 right-0 w-2/3" onClick={(event) => { event.stopPropagation(); if (!swipedRef.current && !isAnimating && !showReplyInput) goNext(); }} />
      </div>

      {/* 3D cube container */}
      <div style={{ perspective: `${containerWidth * 2}px` }} className="absolute inset-0 z-10">
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-${half}px) rotateY(${cubeAngle}deg)`,
            transition: cubeTransition,
          }}
        >
          {/* FRONT face — current story */}
          <div
            className="absolute inset-0 bg-[var(--color-app-bg)]"
            style={{
              transform: `translateZ(${half}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Progress + author header */}
            <div className="absolute inset-x-0 top-0 z-20 px-4 pt-12">
              <div className="mb-4 flex gap-1.5">
                {currentGroup.map((story, index) => {
                  const barColor = story.relevant ? "bg-[var(--color-relevant)]" : "bg-[var(--color-charcoal)]";
                  const trackColor = story.relevant ? "bg-[color:rgba(168,85,247,0.3)]" : "bg-black/10";
                  return (
                    <div key={story.id} className={`h-[3px] flex-1 overflow-hidden rounded-full ${trackColor}`}>
                      {index < storyIndex && <div className={`h-full w-full ${barColor}`} />}
                      {index === storyIndex && (
                        <motion.div
                          key={progressKey}
                          className={`h-full ${barColor}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: AUTO_ADVANCE_DELAY / 1000, ease: "linear" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-black/5 shadow-sm">
                  <img src={currentStory.avatar} alt={currentStory.author} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-[var(--color-charcoal)]">{currentStory.author}</p>
                  <p className="mt-0.5 text-xs font-medium text-black/40">
                    {onboarding ? currentStory.role : `${currentStory.role} · ${formatTimeAgo(currentStory.time)}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 pb-16">
              {onboarding && <OnboardingIllustration storyId={currentStory.id} />}
              <h1 className="text-[2.5rem] font-black leading-[1.06] tracking-tighter text-[var(--color-charcoal)]">
                {currentStory.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <span key={i}>{part.slice(2, -2)}</span>
                    : <span key={i} className="font-medium opacity-45">{part}</span>
                )}
              </h1>
              {!onboarding && (
                <p className="mt-3 text-xs font-medium text-[color:rgba(26,24,22,0.3)]">
                  Summarized by Minimax M2.7
                </p>
              )}
              {onboarding && personIndex === storyGroups.length - 1 && storyIndex === currentGroup.length - 1 && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                  className="pointer-events-auto mt-6 rounded-full bg-[var(--color-charcoal)] px-8 py-3.5 text-sm font-bold text-white shadow-lg"
                >
                  Get Started
                </motion.button>
              )}
              {currentStory.relevant && (
                <div className="pointer-events-auto mt-3 inline-flex items-start gap-2 rounded-xl bg-[color:rgba(168,85,247,0.1)] px-3 py-2">
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-[var(--color-relevant)]" />
                  <p className="text-xs font-medium leading-snug text-[var(--color-relevant)]">{currentStory.relevant}</p>
                </div>
              )}
            </div>
          </div>

          {/* LEFT face — previous person's first story */}
          {prevPersonGroup && showSideFaces && (
            <div
              className="absolute inset-0"
              style={{
                transform: `rotateY(-90deg) translateZ(${half}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <CubeFace story={prevPersonGroup[0]} stories={prevPersonGroup} storyIndex={0} />
            </div>
          )}

          {/* RIGHT face — next person's first story */}
          {nextPersonGroup && showSideFaces && (
            <div
              className="absolute inset-0"
              style={{
                transform: `rotateY(90deg) translateZ(${half}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <CubeFace story={nextPersonGroup[0]} stories={nextPersonGroup} storyIndex={0} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed UI chrome — stays above cube rotation */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {/* X button */}
        <div className="pointer-events-auto absolute top-[4.5rem] right-4">
          {onboarding ? (
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="px-3 py-2 text-sm font-semibold text-black/50">
              Skip
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/8">
              <X size={16} strokeWidth={2.5} className="text-black/60" />
            </motion.button>
          )}
        </div>

        {/* Floating reactions */}
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <FloatingReaction key={reaction.id} reaction={reaction} />
          ))}
        </AnimatePresence>

        {/* Attached PR/ticket card */}
        {(currentStory.pr || currentStory.ticket) && (
          <div className="absolute right-6 bottom-[calc(max(2rem,env(safe-area-inset-bottom))+5rem)] left-6">
            <AttachedCard story={currentStory} />
          </div>
        )}

        {/* Comment bar */}
        {!onboarding && (
          <div className="pointer-events-auto absolute right-4 left-4 bottom-[max(2rem,env(safe-area-inset-bottom))]">
            {showReplyInput ? (
              <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                <input
                  autoFocus
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleReplySubmit();
                    if (event.key === "Escape") setShowReplyInput(false);
                  }}
                  placeholder="Comment on PR..."
                  className="h-14 flex-1 rounded-full border border-white/50 bg-white/70 px-5 text-base font-medium text-[var(--color-charcoal)] shadow-md backdrop-blur-md placeholder:text-black/30"
                />
                <motion.button whileTap={{ scale: 0.92 }} onClick={handleReplySubmit} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)]">
                  <MessageCircle size={18} className="text-white" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        )}

        {replySent && (
          <div className="absolute left-6 bottom-28 inline-flex items-center gap-2 rounded-full bg-[var(--color-charcoal)] px-3 py-2 text-xs font-semibold text-white shadow-md">
            <CircleAlert size={14} />
            Comment on PR sent
          </div>
        )}
      </div>
    </div>
  );
}
