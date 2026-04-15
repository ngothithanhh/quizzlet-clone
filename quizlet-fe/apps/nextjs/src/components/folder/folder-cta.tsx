"use client";

import { Edit } from "lucide-react";

import { useAuth } from "~/contexts/auth-context";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import DeleteFolderDialog from "./delete-folder-dialog";
import FolderDialog from "./folder-dialog";
import FolderStudySetsDialog from "./folder-study-sets-dialog";

interface FolderCTAProps {
  slug: string;
}

const FolderCTA = ({ slug }: FolderCTAProps) => {
  const { user } = useAuth();
  const [data] = api.folder.bySlug.useSuspenseQuery({ slug });

  if (data.userId !== user?.id) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <FolderStudySetsDialog userId={data.userId} />
      <FolderDialog
        defaultValues={{
          id: data.id,
          name: data.name,
          description: data.description ?? undefined,
        }}
      >
        <Button size="icon" variant="outline">
          <Edit size={16} />
        </Button>
      </FolderDialog>
      <DeleteFolderDialog id={data.id} userId={user?.id?.toString() ?? ""} />
    </div>
  );
};

export default FolderCTA;
