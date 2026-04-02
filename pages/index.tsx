import dynamic from "next/dynamic";
import { Inter } from "next/font/google";

import { Items } from "@/components/Items";
import { Contact } from "@/components/Contact";
import { SkillsSection } from "@/components/SkillsSection";
import { Metadata } from "@/components/layout/Metadata";
import blogs from "@/data/BLOGS.json";
import { PROJECTS, CONTRIBUTIONS } from "@/lib/config";
import type { BlogPostJson } from "@/lib/blogTerminal";

const BlogTerminal = dynamic(() => import("@/components/BlogTerminal"), {
  ssr: false,
  loading: () => <div className="min-h-[200px] w-full" aria-hidden />,
});

const inter = Inter({ subsets: ["latin"] });

const blogPosts = blogs as BlogPostJson[];

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-8 ${inter.className}`}
    >
      <Metadata />
      <div className="w-full max-w-[700px]">
        <BlogTerminal posts={blogPosts} />
        <Items items={PROJECTS} label="Projects" link />
        <Items items={CONTRIBUTIONS} label="Contributions" link />
        <SkillsSection />
        <Contact />
      </div>
    </main>
  );
}
