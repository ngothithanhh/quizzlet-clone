import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import ProfileLayout from "~/components/user/profile-layout";
import { api } from "~/trpc/server";

export default async function Layout({
  children,
  params: { id },
}: {
  children: ReactNode;
  params: { id: string };
}) {
  try {
    const user = await api.user.byId({ id });

    return (
      <ProfileLayout user={user}>
        {children}
      </ProfileLayout>
    );
  } catch {
    notFound();
  }
}
