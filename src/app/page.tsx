import { redirect } from "next/navigation";

export default function Home() {
  // Public root just redirects to the login page for now.
  redirect("/login");
}
