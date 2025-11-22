import Image from "next/image";

export default function WelcomeLayout({ children }) {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row  justify-center items-center">
      <div className="flex justify-center items-center flex-1/3 pt-10 md:p-10 ">
        {" "}
        <div className="w-[200] lg:w-[500px] xl:w-[600px] relative">
          <Image
            src="/logos/logo-transparent-svg.svg"
            width={400}
            height={0}
            alt="logo"
            className="w-1/1 h-auto"
            priority
          />
        </div>
      </div>
      {children}
    </main>
  );
}
