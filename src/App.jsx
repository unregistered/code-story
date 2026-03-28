import React, { useState } from "react";
import TeamConstellation from "./components/TeamConstellation";
import StoryViewer from "./components/StoryViewer";
import PostUpdate from "./components/PostUpdate";
import { REPOS } from "./data";

export default function App() {
  const [view, setView] = useState("home");
  const [startAuthorId, setStartAuthorId] = useState(null);
  const [postPrefill, setPostPrefill] = useState(null);
  const [repoId, setRepoId] = useState("openclaw");

  const repo = REPOS.find((r) => r.id === repoId);

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
          onRepoChange={handleRepoChange}
          onMemberTap={handleMemberTap}
          onEditPost={handleEditPost}
        />

        {view === "stories" && (
          <StoryViewer
            key={`stories-${repoId}-${startAuthorId}`}
            stories={repo.stories}
            startAuthorId={startAuthorId}
            onClose={() => setView("home")}
          />
        )}
        {view === "post" && (
          <PostUpdate
            prefill={postPrefill}
            onClose={() => setView("home")}
            onPosted={() => setView("home")}
          />
        )}
      </div>
    </div>
  );
}
