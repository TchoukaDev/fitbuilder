import Image from "next/image";

export default function Footer() {
  return (
    <div className="p-5 py-10 md:p-10 shadow-[0_-2px_2px_rgba(0,0,0,0.1)] flex flex-col md:flex-row justify-center items-center  md:gap-10 ">
      <p className="text-center ">
        ©{new Date().getFullYear()} FitBuilder. Tous droits réservés.
      </p>{" "}
      <div className="flex justify-center items-center  gap-5 ">
        <div className="size-[150px] relative shrink-0">
          <Image
            src="/logos/logo-transparent-svg.svg"
            fill
            alt="logo Fitbuilder"
            priority
          />
        </div>
        <div className="size-[100px] relative shrink-0">
          <Image
            src="/logos/logo-dev.svg"
            fill
            alt="logo Développeur"
            priority
          />
        </div>
      </div>
    </div>
  );
}
