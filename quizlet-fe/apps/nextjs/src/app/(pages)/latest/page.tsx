import type { Metadata } from "next";

import UserStudySets from "~/components/user/user-study-sets";

export const metadata: Metadata = {
  title: "Quizzlet - Latest",
};

export default function Latest() {
  return <UserStudySets />;
}
