"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { useAuth } from "~/contexts/auth-context";
import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";

const CreateOptionsDropdown = () => {
  const { isLoggedIn } = useAuth();
  const [, dispatch] = useFolderDialogContext();
  const { onOpenChange } = useSignInDialogContext();
  const router = useRouter();

  const openSignInDialog = () => onOpenChange(true);

  const onFolderClick = () => {
    if (isLoggedIn) dispatch({ type: "open" });
    else openSignInDialog();
  };

  const onStudySetClick = () => {
    if (isLoggedIn) router.push("/create-set");
    else openSignInDialog();
  };

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Tạo mới</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onFolderClick}>Thư mục</DropdownMenuItem>
          <DropdownMenuItem onClick={onStudySetClick}>Bộ Flashcard</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CreateOptionsDropdown;
