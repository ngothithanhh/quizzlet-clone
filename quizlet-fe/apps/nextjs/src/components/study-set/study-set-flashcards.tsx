"use client";

import { useParams } from "next/navigation";

import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";
import FlashcardCard from "../shared/flashcard-card";
import CopyFlashcardsDialog from "./copy-flashcards-dialog";

const StudySetFlashcards = () => {
  const { user } = useAuth();
  const { id }: { id: string } = useParams();
  const [{ flashcards, userId, id: studySetId }] = api.studySet.byId.useSuspenseQuery({ id });
  const isOwner = userId === user?.id;

  return (
    <div className="mb-8">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-lg font-bold">
          Các thẻ trong bộ này ({flashcards.length})
        </span>
        {/* Luôn hiện cho user đã đăng nhập */}
        {user && (
          <CopyFlashcardsDialog
            flashcards={flashcards}
            currentStudySetId={Number(studySetId)}
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
        {flashcards.map((flashcard, index) => (
          <FlashcardCard
            editable={isOwner}
            key={index}
            flashcard={flashcard}
          />
        ))}
      </div>
    </div>
  );
};

export default StudySetFlashcards;
