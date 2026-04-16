"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FolderPlus,
  Heart,
  Loader2,
  Search,
  User,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { toast } from "@acme/ui/toast";

import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";
import AddToFolderDialog from "~/components/study-set/search-add-folder-dialog";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { isLoggedIn } = useAuth();
  const utils = api.useUtils();

  const { data: results = [], isFetching } = api.studySet.search.useQuery(
    { keyword: submitted },
    { enabled: submitted.length > 0 },
  );

  const { data: favorites = [] } = api.favorite.getAll.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const addFav = api.favorite.add.useMutation({
    onSuccess: () => {
      void utils.favorite.getAll.invalidate();
      toast.success("Đã thêm vào yêu thích ❤️");
    },
    onError: () => toast.error("Không thể thêm yêu thích"),
  });

  const removeFav = api.favorite.remove.useMutation({
    onSuccess: () => {
      void utils.favorite.getAll.invalidate();
      toast.success("Đã bỏ yêu thích");
    },
    onError: () => toast.error("Không thể bỏ yêu thích"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Tìm kiếm Study Sets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Khám phá các bộ học công khai từ cộng đồng
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              id="search-input"
              placeholder="Nhập từ khoá tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!query.trim() || isFetching}
          >
            {isFetching ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Tìm"
            )}
          </Button>
        </form>

        {/* Results */}
        {submitted && (
          <div>
            {isFetching ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-indigo-500" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <BookOpen size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Không tìm thấy kết quả cho <strong>"{submitted}"</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">
                  {results.length} kết quả cho{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    "{submitted}"
                  </span>
                </p>
                {results.map((set) => {
                  const isFav = favorites.some((f: any) => f.id === set.id);
                  const isPendingFav =
                    (addFav.isPending &&
                      addFav.variables?.studySetId === set.id) ||
                    (removeFav.isPending &&
                      removeFav.variables?.studySetId === set.id);

                  return (
                    <Card
                      key={set.id}
                      className="border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <BookOpen size={18} className="text-indigo-600" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/study-sets/${set.id}`}>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {set.title}
                              </h3>
                            </Link>
                            {set.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {set.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5">
                              <Badge
                                variant="outline"
                                className="text-[10px] gap-1"
                              >
                                <BookOpen size={9} />
                                {set.flashcardCount ?? set.flashcards?.length ?? 0} thuật ngữ
                              </Badge>
                              {set.user?.name && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <User size={10} />
                                  {set.user.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {isLoggedIn && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Add to folder */}
                              <AddToFolderDialog studySetId={set.id} />

                              {/* Favourite toggle */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 ${
                                      isFav
                                        ? "text-rose-500 hover:text-rose-600"
                                        : "text-gray-400 hover:text-rose-500"
                                    }`}
                                    disabled={isPendingFav}
                                    onClick={() => {
                                      if (isFav) {
                                        removeFav.mutate({
                                          studySetId: set.id,
                                        });
                                      } else {
                                        addFav.mutate({ studySetId: set.id });
                                      }
                                    }}
                                  >
                                    <Heart
                                      size={15}
                                      className={isFav ? "fill-rose-500" : ""}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state before first search */}
        {!submitted && (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Search size={32} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Gõ từ khoá để tìm kiếm
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tìm study sets công khai từ cộng đồng Quizlet
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
