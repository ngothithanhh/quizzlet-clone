import type { Metadata } from "next";

import UserStudySets from "~/components/user/user-study-sets";

export const metadata: Metadata = {
  title: "Quizlet - Latest",
};

// Auth check done client-side via useAuth() in UserStudySets component
export default function Latest() {
  return <UserStudySets />;
}
