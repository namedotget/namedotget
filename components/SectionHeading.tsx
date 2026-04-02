import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  children,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <Tag
      className={`home-section-heading home-text-xf mb-0 flex w-full items-center gap-3 font-mono ${className}`}
    >
      <span className="home-section-heading__label">{children}</span>
    </Tag>
  );
}
