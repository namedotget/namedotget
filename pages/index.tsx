import Image from "next/image";
import { Inter } from "next/font/google";

import { PROJECTS, CONTRIBUTIONS, SKILLS } from "@/lib/config";
import { Items } from "@/components/Items";
import Link from "next/link";
import { Metadata } from "@/components/layout/Metadata";
import { Contact } from "@/components/Contact";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-8 ${inter.className}`}
    >
      <Metadata />
      {/* <Hero lightMode={lightMode} /> */}
      <Items items={PROJECTS} label="Projects:" link />
      <Items items={CONTRIBUTIONS} label="Contributions:" link />
      <Items items={SKILLS} label="Skills:" />
      <Contact />
      {/* <div className="mt-4 px-4 py-2 w-full md:w-1/2 glass h-full bg-[#1d1d1d] rounded-md">
        <p>Contact Me : colin@namedotget.com</p>
      </div> */}
    </main>
  );
}
