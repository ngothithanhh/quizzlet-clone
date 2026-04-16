"use client";

import { Suspense } from "react";

import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import StudySetCard from "../shared/study-set-card";
import StudySetSkeletonGrid from "../shared/study-set-skeleton-grid";

const PopularStudySetsGrid = () => {
  const query = api.studySet.popular.useSuspenseQuery();
  const [studySets] = query;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!studySets || studySets.length === 0) {
    return <Empty message="Chưa có bộ Flashcard phổ biến nào." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {studySets.map((set) => (
        <StudySetCard key={set.id} studySet={set} />
      ))}
    </div>
  );
};

const PopularStudySets = () => {
  return (
    <div>
      <h2 className="mb-8 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
        Bộ Flashcard phổ biến
      </h2>
      <Suspense fallback={<StudySetSkeletonGrid />}>
        <PopularStudySetsGrid />
      </Suspense>
    </div>
  );
};

export default PopularStudySets;
