import Image from "next/image";
import LogoutButton from "../../Buttons/LogoutButton";
import Navbar from "../Navbar/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex justify-between items-center relative pr-5 lg:pl-10 md:pr-20 border-b border-primary-50 shadow">
      {/* Logo */}
      <div className="size-[100px] md:size-[200px] relative ">
        <Image
          src="/logos/logo-transparent-svg.svg"
          fill
          alt="logo Fitbuilder"
          priority
        />
      </div>

      {/* Navbar */}
      <div className="absolute lg:static left-1/2 -translate-x-1/2 lg:translate-0">
        <Navbar />
      </div>

      {/* Bouton de déconnexion */}
      <LogoutButton />
    </div>
  );
}
