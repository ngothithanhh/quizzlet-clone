"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";

const FolderAuthor = () => {
  const { slug }: { slug: string } = useParams();
  const [folder] = api.folder.bySlug.useSuspenseQuery({ slug });

  const username = (folder as any).username ?? "Anonymous";
  const userId = folder.userId;

  return (
    <div className="flex items-center gap-6">
      <span className="text-sm">{folder.studySets?.length ?? 0} sets</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">created by</span>
        <Link href={`/users/${userId}`} className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <Button className="p-0 text-foreground" variant="link">
            {username}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FolderAuthor;
