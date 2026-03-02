import Image from "next/image";
import { NavbarServer } from "./Navbar";

export default async function Header() {
  return (
    <>
      {/* Header mobile */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-primary-50 shadow">
        <span className="font-bold text-primary-900 text-lg">FitBuilder</span>
        <div className="relative h-12 w-12">
          <Image
            src="/logos/logo-transparent-svg.svg"
            fill
            alt="logo Fitbuilder"
            priority
          />
        </div>
        {/* NavbarServer renders NavbarClient which contains the fixed bottom bar + mobile header actions */}
        <NavbarServer />
      </header>

      {/* Header desktop */}
      <div className="hidden lg:flex relative justify-evenly heroBg items-center pr-5 lg:pl-10 md:pr-20 border-b border-primary-50 shadow">
        {/* Logo */}
        <div className="size-[100px] -ml-3 md:ml-0 md:size-[150px] lg:size-[200px] relative">
          <Image
            src="/logos/logo-transparent-svg.svg"
            fill
            alt="logo Fitbuilder"
            priority
          />
        </div>

        {/* Navbar */}
        <div className="absolute lg:static left-1/2 -translate-x-1/2 lg:translate-0">
          <NavbarServer />
        </div>
      </div>
    </>
  );
}
