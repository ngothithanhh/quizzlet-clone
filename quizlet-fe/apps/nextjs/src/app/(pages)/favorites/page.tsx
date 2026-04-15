"use client";

import Link from "next/link";
import { BookOpen, ExternalLink, Heart, Loader2, Star } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter } from "@acme/ui/card";

import { api } from "~/trpc/react";

function StudySetFavoriteCard({ studySet }: { studySet: any }) {
  const utils = api.useUtils();
  const remove = api.favorite.remove.useMutation({
    onSuccess: () => void utils.favorite.getAll.invalidate(),
  });

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link
            href={`/study-sets/${studySet.id}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 flex-1"
          >
            {studySet.title}
          </Link>
          <button
            onClick={() => remove.mutate({ studySetId: studySet.id })}
            disabled={remove.isPending}
            className="flex-shrink-0 text-rose-500 hover:text-rose-700 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
            title="Bỏ yêu thích"
          >
            <Heart size={16} fill="currentColor" />
          </button>
        </div>

        {studySet.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {studySet.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs gap-1">
            <BookOpen size={10} />
            {studySet.flashcards?.length ?? studySet.flashcardCount ?? 0} thuật ngữ
          </Badge>
          {studySet.user?.username && (
            <span className="text-xs text-gray-400 truncate">
              bởi {studySet.user.username}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1 text-xs h-7">
          <Link href={`/study-sets/${studySet.id}/flashcards`}>
            Học thẻ
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7">
          <Link href={`/study-sets/${studySet.id}`}>
            <ExternalLink size={11} className="mr-1" />
            Xem
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = api.favorite.getAll.useQuery();

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
          <Heart size={22} className="text-white" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yêu thích</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Study sets bạn đã đánh dấu yêu thích
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-rose-500" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
            <Heart size={36} className="text-rose-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Chưa có study set yêu thích
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              Nhấn vào biểu tượng ❤️ trên bất kỳ study set nào để thêm vào đây
            </p>
          </div>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/latest">Khám phá Study Sets</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {favorites.length} study set yêu thích
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((set) => (
              <StudySetFavoriteCard key={set.id} studySet={set} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
