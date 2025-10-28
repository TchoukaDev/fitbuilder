"use client";
import {
  ClipboardPen,
  Dumbbell,
  LayoutDashboard,
  Settings,
  UserRoundPen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ isAdmin = false }) {
  const links = [
    [
      "Tableau de bord",
      "/dashboard",
      <LayoutDashboard className="size-6 md:size-10 animatedRotation" />,
    ],
    [
      "Exercices",
      "/exercices",
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
    <div className="flex items-center gap-3 md:gap-10 p-3 md:p-8 border shadow rounded-full">
      {links.map((link) => {
        if (link[3] === "reserved" && !isAdmin) {
          return null;
        }
        return (
          <div key={link[1]}>
            {" "}
            <Link
              title={link[0]}
              className={`${
                pathname === link[1] ? "text-primary-500" : "text-primary-300"
              } animatedRotation`}
              href={link[1]}
            >
              {link[2]}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
