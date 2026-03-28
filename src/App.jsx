import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TeamConstellation from "./components/TeamConstellation";
import StoryViewer from "./components/StoryViewer";
import PostUpdate from "./components/PostUpdate";
import { STORIES } from "./data";

const shellStyle = {
  width: "100%",
  maxWidth: "390px",
  height: "100dvh",
  maxHeight: "844px",
};

export default function App() {
  const [view, setView] = useState("home");
  const [storyStartIndex, setStoryStartIndex] = useState(0);
  const [postPrefill, setPostPrefill] = useState(null);

  const handleMemberTap = (member) => {
    const idx = STORIES.findIndex((story) => story.authorId === member.id);
    setStoryStartIndex(idx >= 0 ? idx : 0);
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
        className="relative overflow-hidden bg-[var(--color-app-bg)] shadow-[0_25px_60px_rgba(0,0,0,0.55)] sm:h-[844px] sm:rounded-[40px] sm:border-[8px] sm:border-black"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <TeamConstellation onMemberTap={handleMemberTap} onEditPost={handleEditPost} />

        <AnimatePresence mode="wait">
          {view === "stories" && (
            <StoryViewer
              key={`stories-${storyStartIndex}`}
              startIndex={storyStartIndex}
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
