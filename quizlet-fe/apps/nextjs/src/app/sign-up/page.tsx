import { redirect } from "next/navigation";

// Redirect to home - Sign Up is now a modal dialog
export default function SignUpPage() {
  redirect("/");
}

