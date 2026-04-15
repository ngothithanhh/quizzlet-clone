import { redirect } from "next/navigation";

// Redirect to home - Login is now a modal dialog
export default function LoginPage() {
  redirect("/");
}

