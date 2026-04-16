"use client";

import Link from "next/link";
import { Edit, Heart } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { toast } from "@acme/ui/toast";

import StudySetFoldersDialog from "./study-set-folders-dialog";
import StudySetOptionsDropdown from "./study-set-options-dropdown";
import StudySetVisibilityToggle from "./study-set-visibility-toggle";
import { useAuth } from "~/contexts/auth-context";
import StudySetShareDialog from "~/components/study-set/study-set-share-dialog";
import { api } from "~/trpc/react";

interface StudySetCTAProps {
  id: string;
  userId: string;
  isPublic?: boolean;
  studySetId?: number;
}

const StudySetCTA = ({ id, userId, isPublic, studySetId }: StudySetCTAProps) => {
  const { isLoggedIn, user } = useAuth();
  const userIdString = user?.id != null ? String(user.id) : undefined;
  const utils = api.useUtils();

  // Derive favorite state from cached list
  const { data: favorites = [] } = api.favorite.getAll.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const isFav = favorites.some((f: any) => String(f.id) === id);

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

  const toggleFav = () => {
    const numId = Number(id);
    if (isFav) {
      removeFav.mutate({ studySetId: numId });
    } else {
      addFav.mutate({ studySetId: numId });
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-2">
        {isLoggedIn && <StudySetFoldersDialog />}

        {/* Visibility toggle — chỉ hiện cho owner */}
        {user != null && String(user.id) === userId && studySetId != null && isPublic != null && (
          <StudySetVisibilityToggle studySetId={studySetId} isPublic={isPublic} />
        )}

        {/* Favourite button */}
        {isLoggedIn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleFav}
                disabled={addFav.isPending || removeFav.isPending}
                className={isFav ? "text-rose-500 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950" : ""}
              >
                <Heart size={16} className={isFav ? "fill-rose-500" : ""} />
                <span className="sr-only">{isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {user?.id === userId && (
          <Tooltip>
            <Link href={`/study-sets/${id}/edit`}>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline">
                  <Edit size={16} />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
            </Link>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        )}
        <StudySetShareDialog id={id} />
        <StudySetOptionsDropdown
          id={id}
          isOwner={user?.id === userId}
          userId={userIdString}
        />
      </div>
    </TooltipProvider>
  );
};

export default StudySetCTA;

