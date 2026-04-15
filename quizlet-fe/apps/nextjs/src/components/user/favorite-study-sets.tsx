"use client";

import { Suspense } from "react";
import { Heart } from "lucide-react";

import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import StudySetCard from "~/components/shared/study-set-card";
import StudySetSkeletonGrid from "~/components/shared/study-set-skeleton-grid";

const FavoriteStudySetsGrid = () => {
  const [favorites] = api.favorite.getAll.useSuspenseQuery();

  if (!favorites || favorites.length === 0) {
    return (
      <Empty message="No favorite study sets yet. Star sets you like to find them here!" />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {favorites.map((set) => (
        <StudySetCard key={set.id} studySet={set} />
      ))}
    </div>
  );
};

const FavoriteStudySets = () => {
  return (
    <div className="mt-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Heart size={20} className="text-red-500" />
        Favorite study sets
      </h2>
      <Suspense fallback={<StudySetSkeletonGrid />}>
        <FavoriteStudySetsGrid />
      </Suspense>
    </div>
  );
};

export default FavoriteStudySets;
