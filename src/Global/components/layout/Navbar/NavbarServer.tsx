"use server";

import { NavbarClient } from ".";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { redirect } from "next/navigation";

export default async function NavbarServer() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return <NavbarClient session={session} />;
}
