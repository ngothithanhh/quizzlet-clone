import type { Metadata } from "next";

import UserStudySets from "~/components/user/user-study-sets";
import { api } from "~/trpc/server";

interface UserStudySetsProps {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: UserStudySetsProps): Promise<Metadata> {
  const user = await api.user.byId({ id });
  return { title: `${user?.username ?? user?.email ?? "User"}'s study sets` };
}

export default async function Page({ params: { id } }: UserStudySetsProps) {
  const user = await api.user.byId({ id });
  return <UserStudySets userId={String(user?.id ?? id)} />;
}
