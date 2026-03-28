import React, { useState, useCallback, useMemo } from "react";
import TeamConstellation from "./components/TeamConstellation";
import StoryViewer from "./components/StoryViewer";
import PostUpdate from "./components/PostUpdate";
import { REPOS } from "./data";

const ONBOARDING_STORIES = [
  { id: "onb-4", authorId: "onboarding", author: "Eazo Story", avatar: "/favicon.svg", role: "Try it now", time: "now", text: "**No meetings. Just tap.**", reactions: {} },
  { id: "onb-3", authorId: "onboarding", author: "Eazo Story", avatar: "/favicon.svg", role: "Smart relevance", time: "now", text: "It highlights **changes that impact your work.**", reactions: {} },
  { id: "onb-2", authorId: "onboarding", author: "Eazo Story", avatar: "/favicon.svg", role: "AI-powered recaps", time: "now", text: "AI turns PRs into **3-second recaps.**", reactions: {} },
  { id: "onb-1", authorId: "onboarding", author: "Eazo Story", avatar: "/favicon.svg", role: "The problem with standups", time: "now", text: "30 minutes of standup. 2 minutes of useful info. **Something's broken.**", reactions: {} },
];

function getAllMembers(rawRepo) {
  const members = [...rawRepo.team];
  if (rawRepo.me) members.push(rawRepo.me);
  return members;
}

function parseTimeAgo(str) {
  const m = str.match(/(\d+)(m|h|d)/);
  if (!m) return 0;
  return m[2] === "d" ? m[1] * 1440 : m[2] === "h" ? m[1] * 60 : +m[1];
}

function deriveRepo(rawRepo, meId) {
  const all = getAllMembers(rawRepo);
  const me = all.find((m) => m.id === meId) || null;
  const team = all.filter((m) => m.id !== meId);

  const defaultMeId = rawRepo.me?.id ?? null;
  let pendingPosts = rawRepo.pendingPosts || [];
  if (me && meId !== defaultMeId) {
    const mySmall = rawRepo.stories.filter(s => s.authorId === meId && s.aiTag === "small");
    pendingPosts = mySmall.map(s => ({
      id: s.id,
      text: s.text,
      ticket: s.pr ? { title: s.pr.title, status: s.pr.status } : null,
      landedAt: Date.now() - parseTimeAgo(s.time) * 60000,
      aiTag: "small",
    }));
  }

  return { ...rawRepo, me, team, pendingPosts };
}

export default function App() {
  const [view, setView] = useState("home");
  const [startAuthorId, setStartAuthorId] = useState(null);
  const [postPrefill, setPostPrefill] = useState(null);
  const [repoId, setRepoId] = useState("openclaw");
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("hasSeenOnboarding"));

  const [readStories, setReadStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("readStories") || "{}");
    } catch { return {}; }
  });

  const [meOverrides, setMeOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("meOverrides") || "{}");
    } catch { return {}; }
  });

  const rawRepo = REPOS.find((r) => r.id === repoId);
  const defaultMeId = rawRepo.me?.id ?? null;
  const meId = repoId in meOverrides ? meOverrides[repoId] : defaultMeId;
  const repo = useMemo(() => deriveRepo(rawRepo, meId), [rawRepo, meId]);

  const markStoryRead = useCallback((storyId) => {
    setReadStories((prev) => {
      const repoRead = new Set(prev[repoId] || []);
      if (repoRead.has(storyId)) return prev;
      repoRead.add(storyId);
      const next = { ...prev, [repoId]: [...repoRead] };
      localStorage.setItem("readStories", JSON.stringify(next));
      return next;
    });
  }, [repoId]);

  const allMembers = useMemo(() => getAllMembers(rawRepo), [rawRepo]);

  const handleSetMe = useCallback((memberId) => {
    setMeOverrides((prev) => {
      const next = { ...prev, [repoId]: memberId };
      localStorage.setItem("meOverrides", JSON.stringify(next));
      return next;
    });
  }, [repoId]);

  const handleResetData = useCallback(() => {
    localStorage.removeItem("readStories");
    localStorage.removeItem("meOverrides");
    localStorage.removeItem("hasSeenOnboarding");
    setReadStories({});
    setMeOverrides({});
    setShowOnboarding(true);
  }, []);

  const handleMemberTap = (member) => {
    setStartAuthorId(member.id);
    setView("stories");
  };

  const handleEditPost = (prefill) => {
    setPostPrefill(prefill);
    setView("post");
  };

  const handleRepoChange = (id) => {
    setRepoId(id);
    setView("home");
    setStartAuthorId(null);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[var(--color-app-bg)]">
      <div className="relative w-full h-dvh max-w-[540px] mx-auto overflow-hidden bg-[var(--color-app-bg)]">
        <TeamConstellation
          repo={repo}
          readStories={readStories[repoId] || []}
          allMembers={allMembers}
          currentMeId={meId}
          onSetMe={handleSetMe}
          onResetData={handleResetData}
          onRepoChange={handleRepoChange}
          onMemberTap={handleMemberTap}
          onEditPost={handleEditPost}
        />

        {showOnboarding && (
          <StoryViewer
            stories={ONBOARDING_STORIES}
            startAuthorId="onboarding"
            onboarding
            onClose={() => {
              localStorage.setItem("hasSeenOnboarding", "1");
              setShowOnboarding(false);
            }}
          />
        )}

        {view === "stories" && (
          <StoryViewer
            key={`stories-${repoId}-${startAuthorId}`}
            stories={repo.stories.filter(s => s.aiTag !== "small")}
            startAuthorId={startAuthorId}
            readStories={readStories[repoId] || []}
            onClose={() => setView("home")}
            onView={markStoryRead}
          />
        )}
        {postPrefill && (
          <PostUpdate
            prefill={postPrefill}
            isOpen={view === "post"}
            onClose={() => setView("home")}
            onPosted={() => {
              setView("home");
              setPostPrefill(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
