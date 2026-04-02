export type BlogPostJson = {
  command: string;
  title: string;
  summary?: string;
  href?: string;
  linkLabel?: string;
};

export type TerminalStep =
  | {
      type: "command";
      text: string;
      speed?: number;
      after?: number;
    }
  | {
      type: "output";
      text: string;
      style?: "output" | "faint";
      after?: number;
    }
  | {
      type: "link";
      text: string;
      label?: string;
      href: string;
      after?: number;
    };

const defaultCommandAfter = 620;
const defaultOutputAfter = 720;
const defaultFaintAfter = 760;
const defaultLinkAfter = 480;

export const DEFAULT_COMMAND_TYPING_MS = 105;
const defaultCommandSpeed = DEFAULT_COMMAND_TYPING_MS;

export function buildStepsFromPosts(posts: BlogPostJson[]): TerminalStep[] {
  const steps: TerminalStep[] = [];
  for (const p of posts) {
    steps.push({
      type: "command",
      text: p.command,
      speed: defaultCommandSpeed,
      after: defaultCommandAfter,
    });
    steps.push({
      type: "output",
      text: p.title,
      style: "output",
      after: defaultOutputAfter,
    });
    if (p.summary?.trim()) {
      steps.push({
        type: "output",
        text: p.summary.trim(),
        style: "faint",
        after: defaultFaintAfter,
      });
    }
    if (p.href?.trim()) {
      steps.push({
        type: "link",
        text: "Read post",
        label: p.linkLabel?.trim() || p.href.trim(),
        href: p.href.trim(),
        after: defaultLinkAfter,
      });
    }
  }
  return steps;
}

export type TranscriptRow =
  | { kind: "command"; text: string }
  | { kind: "output"; text: string; style: "output" | "faint" }
  | { kind: "link"; lead: string; label: string; href: string };
