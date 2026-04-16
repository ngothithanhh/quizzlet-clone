"use client";

import { Star, Volume2 } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { useAuth } from "~/contexts/auth-context";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import useStar from "~/hooks/use-star";
import EditFlashcardDialog from "./edit-flashcard-dialog";
import { api } from "~/trpc/react";

interface FlashcardCardProps {
  flashcard: RouterOutputs["studySet"]["byId"]["flashcards"][number];
  editable?: boolean;
}

const FlashcardCard = ({
  flashcard,
  editable,
}: FlashcardCardProps) => {
  const { isLoggedIn } = useAuth();
  const { term, definition } = flashcard;
  const { toggleStar } = useStar(flashcard);
  const { onOpenChange } = useSignInDialogContext();

  const ttsQuery = api.externalApi.tts.useQuery(
    { text: term ?? "", lang: "en" },
    { enabled: false },
  );

  const onStarClick = () => {
    if (isLoggedIn) {
      toggleStar();
    } else {
      onOpenChange(true);
    }
  };

  const onTtsClick = async () => {
    if (!term) return;
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

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row">
        <div className="order-2 flex h-6 items-center justify-end gap-1">
          {/* TTS */}
          <Button
            onClick={onTtsClick}
            size="icon"
            variant="ghost"
            className="rounded-full"
            title="Nghe phát âm"
            disabled={ttsQuery.isFetching}
          >
            <Volume2
              size={15}
              className={ttsQuery.isFetching ? "animate-pulse text-blue-400" : "text-blue-500"}
            />
          </Button>
          {editable && <EditFlashcardDialog flashcard={flashcard} />}
          <Button
            onClick={onStarClick}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Star
              className={flashcard.starred ? "text-yellow-300" : undefined}
              size={16}
            />
          </Button>
        </div>
        <div className="whitespace-pre-line sm:flex-1">{term}</div>
        <Separator className="my-2 sm:hidden" />
        <div className="mx-4 hidden sm:block">
          <Separator orientation="vertical" />
        </div>
        <div className="whitespace-pre-line sm:flex-1">{definition}</div>
      </CardContent>
    </Card>
  );
};

export default FlashcardCard;
