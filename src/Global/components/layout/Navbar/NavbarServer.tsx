"use server";

import { NavbarClient } from ".";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);
  return <NavbarClient session={session} />;
}
