import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import FlashcardsGame from "~/components/flashcards-mode/flashcards-game";
import CreatedBy from "~/components/study-set/created-by";
import OtherStudySets from "~/components/study-set/other-study-sets";
import StudyModes from "~/components/study-set/study-modes";
import StudySetCTA from "~/components/study-set/study-set-cta";
import StudySetFlashcards from "~/components/study-set/study-set-flashcards";
import StudySetInfo from "~/components/study-set/study-set-info";
import FlashcardsModeProvider from "~/contexts/flashcards-mode-context";
import { api, HydrateClient } from "~/trpc/server";

interface StudySetProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: StudySetProps): Promise<Metadata> {
  const studySet = await api.studySet.byId({ id });
  return { title: studySet?.title ?? "Study Set" };
}

export default async function StudySet({ params: { id } }: StudySetProps) {
  const studySet = await api.studySet.byId({ id });
  const otherStudySets = await api.studySet.other({
    studySetId: id,
    userId: studySet?.userId ?? "",
  });

  await api.studySet.byId.prefetch({ id });
  await api.folder.allByUser.prefetch({ userId: undefined });
  await api.studySet.allByUser.prefetch({ userId: undefined });

  return (
    <HydrateClient>
      <FlashcardsModeProvider id={id}>
        <div className="m-auto max-w-3xl">
          <StudySetInfo />
          <StudyModes studySetId={id} />
          <FlashcardsGame />
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CreatedBy user={studySet?.user} />
            <StudySetCTA userId={studySet?.userId} id={id} />
          </div>
          <StudySetFlashcards />
          <Link href={`/study-sets/${id}/edit`}>
            <Button size="lg" className="m-auto mb-8 block">
              Add or Remove Terms
            </Button>
          </Link>
          {(otherStudySets?.length ?? 0) > 0 && (
            <OtherStudySets studySets={otherStudySets ?? []} />
          )}
        </div>
      </FlashcardsModeProvider>
    </HydrateClient>
  );
}
