import { Items } from "@/components/Items";
import { SkillsSection } from "@/components/SkillsSection";

export function HomeWorkSectionContent({
  projects,
  contributions,
}: {
  projects: typeof import("@/lib/config").PROJECTS;
  contributions: typeof import("@/lib/config").CONTRIBUTIONS;
}) {
  return (
    <>
      <Items items={projects} label="Projects" link />
      <Items items={contributions} label="Contributions" link />
      <SkillsSection />
    </>
  );
}
