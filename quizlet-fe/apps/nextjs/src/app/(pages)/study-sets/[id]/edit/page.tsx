import type { Metadata } from "next";

import StudySetForm from "~/components/study-set/study-set-form";
import { api } from "~/trpc/server";

interface EditStudySetProps {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: EditStudySetProps): Promise<Metadata> {
  const studySet = await api.studySet.byId({ id });
  return { title: `${studySet?.title ?? "Study Set"} - Edit` };
}

export default async function Page({ params: { id } }: EditStudySetProps) {
  const studySet = await api.studySet.byId({ id });

  // Auth & ownership check done by client component via useAuth()
  return <StudySetForm defaultValues={studySet} />;
}
