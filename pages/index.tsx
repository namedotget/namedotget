import { Inter } from "next/font/google";

import { PROJECTS, CONTRIBUTIONS } from "@/lib/config";
import { Items } from "@/components/Items";
import { Metadata } from "@/components/layout/Metadata";
import { Contact } from "@/components/Contact";
import { SkillsSection } from "@/components/SkillsSection";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-8 ${inter.className}`}
    >
      <Metadata />
      <div className="w-full max-w-[700px]">
        <Items items={PROJECTS} label="Projects:" link />
        <Items items={CONTRIBUTIONS} label="Contributions:" link />
        <SkillsSection />
        <Contact />
      </div>
    </main>
  );
}
