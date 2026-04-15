import type { Metadata } from "next";

import FlashcardsGame from "~/components/flashcards-mode/flashcards-game";
import FlashcardsModeProvider from "~/contexts/flashcards-mode-context";
import { api, HydrateClient } from "~/trpc/server";

interface FlashcardsModeProps {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: FlashcardsModeProps): Promise<Metadata> {
  const studySet = await api.studySet.byId({ id });
  return { title: `${studySet?.title ?? "Study Set"} - Flashcards` };
}

export default async function FlashcardsMode({ params: { id } }: FlashcardsModeProps) {
  await api.studySet.byId.prefetch({ id });

  return (
    <HydrateClient>
      <FlashcardsModeProvider id={id}>
        <div className="m-auto max-w-5xl">
          <FlashcardsGame fullscreen />
        </div>
      </FlashcardsModeProvider>
    </HydrateClient>
  );
}
