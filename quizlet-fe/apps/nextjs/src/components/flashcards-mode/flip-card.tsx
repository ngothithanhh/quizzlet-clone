"use client";

import { useState } from "react";
import { motion } from "framer-motion";


import { cn } from "@acme/ui";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
import FlipCardContent from "./flip-card-content";

interface FlipCardProps {
  fullscreen?: boolean;
}

const FlipCard = ({ fullscreen }: FlipCardProps) => {
  const { currentCard, cardRef } = useFlashcardsModeContext();

  const [animation, setAnimation] = useState<
    "flipIn" | "flipOut" | undefined
  >();

  const toggleFlip = () => {
    setAnimation((prev) =>
      !prev || prev === "flipOut" ? "flipIn" : "flipOut",
    );
  };

  const flipVariants = {
    flipIn: {
      rotateX: [0, 180],
    },
    flipOut: {
      rotateX: [180, 360],
    },
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div
      role="button"
      onClick={toggleFlip}
      ref={cardRef}
      className={cn("w-full [perspective:1000px]", {
        "min-h-[21rem] sm:min-h-[25rem]": !fullscreen,
        "min-h-[40rem]": fullscreen,
      })}
    >
      <motion.div
        variants={flipVariants}
        animate={animation}
        className="relative h-full w-full cursor-pointer [transform-style:preserve-3d]"
      >
        <FlipCardContent flashcard={currentCard} />
        <FlipCardContent flashcard={currentCard} back />
      </motion.div>
    </div>
  );
};

export default FlipCard;
