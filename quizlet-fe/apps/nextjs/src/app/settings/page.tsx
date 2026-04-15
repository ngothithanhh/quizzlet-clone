import type { Metadata } from "next";

import ChangePassword from "~/components/settings/change-password";
import DarkMode from "~/components/settings/dark-mode";
import DeleteAccount from "~/components/settings/delete-account";
import EditProfilePicture from "~/components/settings/edit-profile-picture";

export const metadata: Metadata = {
  title: "Quizlet - Settings",
};

// Auth check handled by client components via useAuth()
export default function Settings() {
  return (
    <>
      <h2 className="mb-8 text-2xl font-bold">Settings</h2>
      <EditProfilePicture />
      <ChangePassword />
      <DarkMode />
      <DeleteAccount />
    </>
  );
}
