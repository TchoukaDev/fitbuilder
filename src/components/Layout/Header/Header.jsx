import Image from "next/image";
import LogoutButton from "../../Buttons/LogoutButton";
import Navbar from "../Navbar/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GiBiceps } from "react-icons/gi";

export default async function PageLayout() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
  return (
    <div className="flex justify-between items-center relative pr-5 lg:pl-10 md:pr-20 border-b border-primary-50 shadow">
      {/* Logo */}
      <div className="size-[100px] md:size-[200px] relative ">
        <Image
          src="/logos/logo-transparent-svg.svg"
          fill
          alt="logo Fitbuilder"
        />
      </div>

      {/* Navbar */}
      <div className="absolute lg:static left-1/2 -translate-x-1/2 lg:translate-0">
        <Navbar isAdmin={isAdmin} />
      </div>
      <div className="hidden lg:inline-block text-center text-xl font-display text-accent-600 font-semibold">
        <p className="flex justify-center gap-3 items-center  ">
          Hello {session?.user?.username} 💪
        </p>
        <p>Prêt pour une nouvelle séance?</p>
      </div>
      {/* Bouton de déconnexion */}
      <LogoutButton />
    </div>
  );
}
