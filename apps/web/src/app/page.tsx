import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-api";

export default async function Home() {
  redirect((await getSession()) ? "/auth/continue" : "/login");
}
