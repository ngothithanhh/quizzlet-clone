"use client";

import type { MouseEvent } from "react";
import { Star, Volume2 } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { useAuth } from "~/contexts/auth-context";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import useStar from "~/hooks/use-star";
import EditFlashcardDialog from "../shared/edit-flashcard-dialog";
import { api } from "~/trpc/react";

interface FlipCardContentProps {
  flashcard: RouterOutputs["studySet"]["byId"]["flashcards"][0];
  editable?: boolean;
  back?: boolean;
}

const FlipCardContent = ({
  flashcard,
  back,
  editable,
}: FlipCardContentProps) => {
  const { isLoggedIn } = useAuth();
  const { toggleStar } = useStar(flashcard);
  const { onOpenChange } = useSignInDialogContext();

  const content = back ? flashcard.definition : flashcard.term;

  // TTS — phát âm nội dung hiển thị
  const ttsQuery = api.externalApi.tts.useQuery(
    { text: content ?? "", lang: "en" },
    { enabled: false },
  );

  const onStarClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (isLoggedIn) {
      toggleStar();
    } else {
      onOpenChange(true);
    }
  };

  const onTtsClick = async (event: MouseEvent) => {
    event.stopPropagation();
    if (!content) return;
    try {
      const result = await ttsQuery.refetch();
      if (result.data?.audioUrl) {
        const audio = new Audio(result.data.audioUrl);
        void audio.play();
      }
    } catch {
      toast.error("Không thể phát âm");
    }
  };

  const title = back ? "Definition" : "Term";

  return (
    <div
      className={cn("absolute h-full w-full [backface-visibility:hidden]", {
        "[transform:rotateX(180deg)]": back,
      })}
    >
      <div className="flex h-full w-full flex-col rounded-lg bg-primary-foreground p-4 drop-shadow-lg md:p-6">
        <div className="flex items-center justify-between">
          <span className="select-none font-semibold">{title}</span>
          <div className="flex justify-end gap-1">
            {/* TTS button */}
            <Button
              className="rounded-full"
              onClick={onTtsClick}
              variant="ghost"
              size="icon"
              title="Nghe phát âm"
              disabled={ttsQuery.isFetching}
            >
              <Volume2
                size={16}
                className={ttsQuery.isFetching ? "animate-pulse text-blue-400" : "text-blue-500 hover:text-blue-600"}
              />
            </Button>

            {editable && <EditFlashcardDialog flashcard={flashcard} />}
            <Button
              className="rounded-full"
              onClick={onStarClick}
              variant="ghost"
              size="icon"
            >
              <Star
                size={16}
                className={flashcard.starred ? "text-yellow-300" : undefined}
              />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="select-none text-3xl">{content}</span>
        </div>
      </div>
    </div>
  );
};

export default FlipCardContent;
