import type { Metadata } from "next";

import StudySetForm from "~/components/study-set/study-set-form";

export const metadata: Metadata = {
  title: "Create study set",
};

// Auth check done client-side via useAuth()
export default function CreateSet() {
  return <StudySetForm />;
}
