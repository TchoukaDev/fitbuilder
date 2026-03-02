"use client";

import { LogoutButton } from "@/Features/Auth/components";
import {
  Activity,
  Calendar,
  ClipboardPen,
  Dumbbell,
  LayoutDashboard,
  LucideIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

type NavLink = {
  label: string;
  href: string;
  Icon: LucideIcon;
  reserved?: boolean;
};

const links: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Exercices", href: "/exercises", Icon: Dumbbell },
  { label: "Entraînements", href: "/workouts", Icon: ClipboardPen },
  { label: "Séances", href: "/sessions", Icon: Activity },
  { label: "Calendrier", href: "/calendar", Icon: Calendar },
  { label: "Admin", href: "/admin", Icon: Settings, reserved: true },
];

export default function NavbarClient({ session }: { session: Session }) {
  const isAdmin = session?.user?.role === "ADMIN";
  const pathname = usePathname();
  const visibleLinks = links.filter((l) => !l.reserved || isAdmin);
  const mobileLinks = visibleLinks.filter((l) => !l.reserved);

  return (
    <>
      {/* Mobile header actions (admin link + logout) — rendered inside the mobile <header> flex */}
      <div className="lg:hidden flex items-center gap-1">
        {isAdmin && (
          <Link
            href="/admin"
            aria-label="Admin"
            className="flex items-center justify-center h-11 w-11 text-primary-300"
          >
            <Settings className="size-6" />
          </Link>
        )}
        <LogoutButton header />
      </div>

      {/* Mobile: bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary-100 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-16">
          {mobileLinks.map(({ label, href, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-0.5 px-2 ${isActive ? "text-primary-500" : "text-primary-300"
                  }`}
              >
                <Icon className="size-6 animatedRotation" />
                <span className="text-[10px] font-medium leading-none">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: pill nav */}
      <nav className="hidden lg:flex items-center gap-3 md:gap-10 py-6 px-10 md:p-10 border border-primary-100 shadow rounded-full">
        {visibleLinks.map(({ label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <div className="relative group" key={href}>
              <Link
                title={label}
                aria-label={label}
                className={`${isActive ? "text-primary-500" : "text-primary-300"
                  } animatedRotation`}
                href={href}
              >
                <Icon className="size-6 md:size-10 animatedRotation" />
              </Link>
              <div
                className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold ${isActive ? "text-primary-500" : "text-primary-300"
                  } text-xs left-1/2 -translate-x-1/2 mt-3`}
              >
                {label}
              </div>
            </div>
          );
        })}
        <LogoutButton />
      </nav>
    </>
  );
}
