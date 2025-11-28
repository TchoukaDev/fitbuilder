import Image from "next/image";
import Navbar from "./Navbar";

export default async function Header() {
  return (
    <div className="flex relative justify-evenly  heroBg  items-center  pr-5 lg:pl-10 md:pr-20 border-b border-primary-50 shadow">
      {/* Logo */}
      <div className="size-[100px] invisible lg:visible -ml-3 md:ml-0 md:size-[150px] lg:size-[200px] relative ">
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
    </div>
  );
}
