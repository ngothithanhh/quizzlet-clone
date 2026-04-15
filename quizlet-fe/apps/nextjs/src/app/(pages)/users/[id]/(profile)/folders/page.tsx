import type { Metadata } from "next";

import UserFolders from "~/components/user/user-folders";
import { api } from "~/trpc/server";

interface UserFoldersProps {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: UserFoldersProps): Promise<Metadata> {
  const user = await api.user.byId({ id });
  return { title: `${user?.username ?? user?.email ?? "User"}'s folders` };
}

export default async function Page({ params: { id } }: UserFoldersProps) {
  const user = await api.user.byId({ id });

  await api.folder.allByUser.prefetch({ userId: id });

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{user?.username ?? "User"}'s folders</h1>
      <UserFolders userId={id} />
    </>
  );
}
