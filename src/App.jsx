import React, { useState } from "react";
import TeamConstellation from "./components/TeamConstellation";
import StoryViewer from "./components/StoryViewer";
import PostUpdate from "./components/PostUpdate";
import { REPOS } from "./data";

const shellStyle = {
  width: "100%",
  height: "100dvh",
};

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
    <div className="flex min-h-svh w-full items-center justify-center bg-[var(--color-shell)]">
      <div
        style={shellStyle}
        className="relative overflow-hidden bg-[var(--color-app-bg)] sm:max-w-[390px] sm:max-h-[844px] sm:h-[844px] sm:rounded-[40px] sm:border-[8px] sm:border-black sm:shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
      >
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
