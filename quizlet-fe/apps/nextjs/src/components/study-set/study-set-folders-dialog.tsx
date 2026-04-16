"use client";

import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuth } from "~/contexts/auth-context";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import Empty from "@acme/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { api } from "~/trpc/react";
import StudySetFolderCard from "./study-set-folder-card";

const StudySetFoldersDialog = () => {
  const { user } = useAuth();
  const { id }: { id: string } = useParams();
  const [folders] = api.folder.allByUser.useSuspenseQuery({
    userId: user?.id?.toString() ?? "",
  });
  const [studySet] = api.studySet.byId.useSuspenseQuery({ id });
  const [, dispatch] = useFolderDialogContext();

  const openFolderDialog = () => {
    dispatch({ type: "open" });
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus size={16} />
              <span className="sr-only">Thêm vào thư mục</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Thêm vào thư mục</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thư mục</DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa bộ Flashcard khỏi thư mục
          </DialogDescription>
        </DialogHeader>
        <Button onClick={openFolderDialog}>Tạo thư mục mới</Button>
        {folders.length ? (
          <div className="flex flex-col gap-4">
            {folders.map((folder) => {
              return (
                <StudySetFolderCard
                  key={folder.id}
                  isIn={studySet.folders?.some((f) => f.id === folder.id) ?? false}
                  folder={folder}
                  studySetId={id}
                />
              );
            })}
          </div>
        ) : (
          <Empty message="You have no folders yet" className="my-3" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudySetFoldersDialog;
