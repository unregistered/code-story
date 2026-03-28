import React, { useState } from "react";
import { motion } from "framer-motion";
import TeamConstellation from "./components/TeamConstellation";
import StoryViewer from "./components/StoryViewer";
import PostUpdate from "./components/PostUpdate";

const shellStyle = {
  width: "100%",
  height: "100dvh",
};

export default function App() {
  const [view, setView] = useState("home");
  const [startAuthorId, setStartAuthorId] = useState(null);
  const [postPrefill, setPostPrefill] = useState(null);

  const handleMemberTap = (member) => {
    setStartAuthorId(member.id);
    setView("stories");
  };

  const handleEditPost = (prefill) => {
    setPostPrefill(prefill);
    setView("post");
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[var(--color-shell)]">
      <motion.div
        style={shellStyle}
        className="relative overflow-hidden bg-[var(--color-app-bg)] sm:max-w-[390px] sm:max-h-[844px] sm:h-[844px] sm:rounded-[40px] sm:border-[8px] sm:border-black sm:shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <TeamConstellation onMemberTap={handleMemberTap} onEditPost={handleEditPost} />

        {view === "stories" && (
          <StoryViewer
            key={`stories-${startAuthorId}`}
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
      </motion.div>
    </div>
  );
}
