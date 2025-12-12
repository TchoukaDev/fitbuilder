"use server";

import { NavbarClient } from ".";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);
  return <NavbarClient session={session} />;
}
