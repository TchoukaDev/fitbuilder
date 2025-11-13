"use client";
import {
  ClipboardPen,
  Dumbbell,
  LayoutDashboard,
  Settings,
  UserRoundPen,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const links = [
    [
      "Tableau de bord",
      "/dashboard",
      <LayoutDashboard className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Exercices",
      "/exercises",
      <Dumbbell className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Séances",
      "/workouts",
      <ClipboardPen className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Profil",
      "/profile",
      <UserRoundPen className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Admin",
      "/admin",
      <Settings className="size-6 md:size-10 animatedRotation" />,
      "reserved",
    ],
  ];

  const pathname = usePathname();
  return (
    <nav className="flex  items-center gap-3 md:gap-10 p-3 md:p-8 border border-primary-100 shadow rounded-full">
      {links.map((link) => {
        if (link[3] === "reserved" && !isAdmin) {
          return null;
        }
        return (
          <div className="relative group" key={link[1]}>
            {" "}
            <Link
              title={link[0]}
              aria-label={link[0]}
              className={`${
                pathname === link[1] ? "text-primary-500" : "text-primary-300"
              } animatedRotation`}
              href={link[1]}
            >
              {link[2]}
            </Link>
            <div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:block font-semibold  ${
                pathname === link[1] ? "text-primary-500 " : "text-primary-300"
              } text-xs left-1/2 -translate-x-1/2 mt-1`}
            >
              {link[0]}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
