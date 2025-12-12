"use client";

import { LogoutButton } from "@/Features/Auth/components";
import {
  Activity,
  Calendar,
  ClipboardPen,
  Dumbbell,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarClient({ session }) {
  const isAdmin = session?.user?.role === "ADMIN";
  const links = [
    [
      "Aperçu",
      "/dashboard",
      <LayoutDashboard className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Exercices",
      "/exercises",
      <Dumbbell className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Entraînements",
      "/workouts",
      <ClipboardPen className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Séances",
      "/sessions",
      <Activity className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Calendrier",
      "/calendar",
      <Calendar className="size-6 md:size-10 animatedRotation" />,
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
    <nav className="flex  items-center gap-3 md:gap-10 py-6 px-10 md:p-10 border border-primary-100 shadow rounded-full">
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
              className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:block font-semibold  ${
                pathname === link[1] ? "text-primary-500 " : "text-primary-300"
              } text-xs left-1/2 -translate-x-1/2 mt-3`}
            >
              {link[0]}
            </div>
          </div>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
