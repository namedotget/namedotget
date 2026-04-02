import { SectionHeading } from "@/components/SectionHeading";
import { SKILL_CATEGORIES } from "@/lib/config";

function SkillCard({
  category,
  index,
  isLast,
  totalCount,
}: {
  category: { name: string; skills: string[] };
  index: number;
  isLast: boolean;
  totalCount: number;
}) {
  const shouldSpanTwo = isLast && totalCount % 2 === 1;
  return (
    <div
      className={`home-term-glass card-glow rounded-lg p-5 font-mono ${
        shouldSpanTwo ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="text-home-accent home-text-xf mb-3 text-lg font-semibold">
        {category.name}
      </h3>
      <ul className="space-y-2">
        {category.skills.map((skill, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-home-chevron home-text-xf leading-none">
              {">"}
            </span>
            <span className="text-home-body home-text-xf">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsSection() {
  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <SectionHeading as="h2">Skills</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_CATEGORIES.map((category, index) => (
          <SkillCard
            key={category.name}
            category={category}
            index={index}
            isLast={index === SKILL_CATEGORIES.length - 1}
            totalCount={SKILL_CATEGORIES.length}
          />
        ))}
      </div>
    </div>
  );
}
