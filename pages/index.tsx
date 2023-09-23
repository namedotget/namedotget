import Image from "next/image";
import { Inter } from "next/font/google";

import { PROJECTS, CONTRIBUTIONS, SKILLS } from "@/lib/config";
import { Items } from "@/components/home/Items";
import { Hero } from "@/components/home/Hero";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-8 ${inter.className}`}
    >
      <Hero />
      <Items items={PROJECTS} label="Projects:" link />
      <Items items={CONTRIBUTIONS} label="Contributions:" link />
      <Items items={SKILLS} label="Skills:" />
      {/* <div className="mt-4 px-4 py-2 w-full md:w-1/2 glass h-full bg-[#1d1d1d] rounded-md">
        <p>Contact Me : colin@namedotget.com</p>
      </div> */}
      <div className="my-12 p-4 flex gap-[40%]">
        <Link
          className="hover:scale-[1.1] transition-all duration-300 opacity-80"
          href="https://github.com/colinmfoster4723"
        >
          <Image src="/github-mark.png" width={82} height={82} alt="" />
        </Link>
        <Link
          className="hover:scale-[1.1] transition-all duration-300 opacity-80"
          href="https://twitter.com/namedotget"
        >
          <Image src="/x-logo.png" width={75} height={75} alt="" />
        </Link>
      </div>
    </main>
  );
}
