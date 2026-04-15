import type { Metadata } from "next";

import LearnMode from "~/components/learn-mode/learn-mode";
import { api, HydrateClient } from "~/trpc/server";

interface LearnModeProps {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: LearnModeProps): Promise<Metadata> {
  const studySet = await api.studySet.byId({ id });
  return { title: `${studySet?.title ?? "Study Set"} - Learn` };
}

export default async function Learn({ params: { id } }: { params: { id: string } }) {
  await api.studySet.learnCards.prefetch({ id });

  return (
    <HydrateClient>
      <div className="m-auto max-w-3xl">
        <LearnMode />
      </div>
    </HydrateClient>
  );
}
