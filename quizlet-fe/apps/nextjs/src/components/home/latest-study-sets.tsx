"use client";

import { Suspense } from "react";

import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import StudySetCard from "../shared/study-set-card";
import StudySetSkeletonGrid from "../shared/study-set-skeleton-grid";

const LatestStudySetsGrid = () => {
  const query = api.studySet.latest.useSuspenseQuery();
  const [studySets] = query;

  if (!studySets || studySets.length === 0) {
    return <Empty message="Chưa có bộ Flashcard mới nào." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {studySets.map((set) => (
        <StudySetCard key={set.id} studySet={set} />
      ))}
    </div>
  );
};

const LatestStudySets = () => {
  return (
    <div className="mt-8">
      <h2 className="mb-8 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">
        Bộ Flashcard mới nhất
      </h2>
      <Suspense fallback={<StudySetSkeletonGrid />}>
        <LatestStudySetsGrid />
      </Suspense>
    </div>
  );
};

export default LatestStudySets;
