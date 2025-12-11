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
      className={`p-5 glass rounded-lg card-glow font-mono ${
        shouldSpanTwo ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="text-lg font-semibold text-ndgGreen mb-3">
        {category.name}
      </h3>
      <ul className="space-y-2">
        {category.skills.map((skill, i) => (
          <li
            key={i}
            className="text-sm text-[#a0a0a0] flex items-center gap-2"
          >
            <span className="text-ndgGreen/60 leading-none">{">"}</span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsSection() {
  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <h1 className="font-bold text-2xl text-center text-[#00000080]">
        Skills:
      </h1>
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
