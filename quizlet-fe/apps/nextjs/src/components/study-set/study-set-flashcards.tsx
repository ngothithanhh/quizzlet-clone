"use client";

import { useParams } from "next/navigation";

import { useAuth } from "~/contexts/auth-context";

import { api } from "~/trpc/react";
import FlashcardCard from "../shared/flashcard-card";

const StudySetFlashcards = () => {
  const { user } = useAuth();
  const { id }: { id: string } = useParams();
  const [{ flashcards, userId }] = api.studySet.byId.useSuspenseQuery({ id });

  return (
    <div className="mb-8">
      <span className="mb-5 inline-block text-lg font-bold">
        Terms in this set ({flashcards.length})
      </span>
      <div className="flex flex-col gap-3">
        {flashcards.map((flashcard, index) => (
          <FlashcardCard
            editable={userId === user?.id}
            key={index}
            flashcard={flashcard}
          />
        ))}
      </div>
    </div>
  );
};

export default StudySetFlashcards;
