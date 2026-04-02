import { Inter } from "next/font/google";

import { CinematicHome } from "@/components/home/CinematicHome";
import { Metadata } from "@/components/layout/Metadata";
import blogs from "@/data/BLOGS.json";
import { PROJECTS, CONTRIBUTIONS } from "@/lib/config";
import type { BlogPostJson } from "@/lib/blogTerminal";

const inter = Inter({ subsets: ["latin"] });

const blogPosts = blogs as BlogPostJson[];

export default function Home() {
  return (
    <>
      <Metadata />
      <CinematicHome
        blogPosts={blogPosts}
        projects={PROJECTS}
        contributions={CONTRIBUTIONS}
        interClassName={inter.className}
      />
    </>
  );
}
