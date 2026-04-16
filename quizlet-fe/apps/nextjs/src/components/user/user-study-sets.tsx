"use client";

import { Suspense } from "react";

import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import StudySetCard from "../shared/study-set-card";
import StudySetSkeletonGrid from "../shared/study-set-skeleton-grid";

const UserStudySetsGrid = ({ userId }: { userId: string }) => {
  const [studySets] = api.studySet.allByUser.useSuspenseQuery({
    userId,
  });

  if (studySets.length === 0) {
    return <Empty message="You have no study sets yet" />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {studySets.map((set) => (
        <StudySetCard key={set.id} studySet={set} />
      ))}
    </div>
  );
};

const UserStudySets = ({
  userId,
  title = "Bộ Flashcard của bạn",
}: {
  userId: string;
  title?: string;
}) => {
  return (
    <>
      <h1 className="mb-8 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 dark:from-orange-400 dark:to-rose-400">
        {title}
      </h1>
      <Suspense fallback={<StudySetSkeletonGrid />}>
        <UserStudySetsGrid userId={userId} />
      </Suspense>
    </>
  );
};

export default UserStudySets;
