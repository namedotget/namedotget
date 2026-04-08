import Link from "next/link";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildStepsFromPosts,
  DEFAULT_COMMAND_TYPING_MS,
  type BlogPostJson,
  type TerminalStep,
  type TranscriptRow,
} from "@/lib/blogTerminal";
import { SectionHeading } from "@/components/SectionHeading";

const PROMPT = "namedotget ~";

function outputClass(style: "output" | "faint"): string {
  if (style === "faint") {
    return "text-home-term-out-faint home-text-xf";
  }
  return "text-home-term-out home-text-xf";
}

function TranscriptRowView({ row }: { row: TranscriptRow }) {
  const lineClass =
    "terminal-line flex min-h-[20px] items-baseline gap-2 font-mono text-[13px] leading-[1.45] sm:text-[13px]";

  if (row.kind === "command") {
    return (
      <div className={lineClass}>
        <span className="text-home-term-prompt home-text-xf shrink-0 whitespace-nowrap">
          {PROMPT}
        </span>
        <span className="text-home-term-cmd home-text-xf whitespace-pre-wrap break-all">
          {row.text}
        </span>
      </div>
    );
  }

  if (row.kind === "output") {
    return (
      <div className={lineClass}>
        <span className="text-home-term-gutter home-text-xf min-w-[20px] shrink-0">
          &gt;
        </span>
        <span className={`whitespace-pre-wrap break-words ${outputClass(row.style)}`}>
          {row.text}
        </span>
      </div>
    );
  }

  const label = row.label ? ` ${row.label}` : "";
  return (
    <div className={lineClass}>
      <span className="text-home-term-gutter home-text-xf min-w-[20px] shrink-0">
        &gt;
      </span>
      <Link
        href={row.href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-home-term-link"
      >
        {row.lead}
        {label}
      </Link>
    </div>
  );
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(readReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(readReducedMotion());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function runAnimatedSequence(
  steps: TerminalStep[],
  setRows: Dispatch<SetStateAction<TranscriptRow[]>>,
  setTyping: Dispatch<SetStateAction<{ full: string; visible: number } | null>>,
  setComplete: Dispatch<SetStateAction<boolean>>,
  scheduleTimeout: (fn: () => void, ms: number) => void,
  isCancelled: () => boolean,
  reducedMotion: boolean,
) {
  function runAt(index: number) {
    if (isCancelled()) return;
    if (index >= steps.length) {
      setTyping(null);
      setComplete(true);
      return;
    }

    const step = steps[index];

    if (step.type === "command") {
      const full = step.text;
      const speed = step.speed ?? DEFAULT_COMMAND_TYPING_MS;

      if (full.length === 0) {
        setRows((prev) => [...prev, { kind: "command", text: full }]);
        setTyping(null);
        scheduleTimeout(() => runAt(index + 1), step.after ?? 0);
        return;
      }

      setTyping({ full, visible: 0 });
      let visible = 0;

      const typeNext = () => {
        if (isCancelled()) return;
        visible += 1;
        setTyping({ full, visible });
        if (visible < full.length) {
          scheduleTimeout(typeNext, speed);
          return;
        }
        setRows((prev) => [...prev, { kind: "command", text: full }]);
        setTyping(null);
        const pause = reducedMotion
          ? Math.min(step.after ?? 0, 180)
          : step.after ?? 0;
        scheduleTimeout(() => runAt(index + 1), pause);
      };

      scheduleTimeout(typeNext, speed);
      return;
    }

    if (step.type === "output") {
      setRows((prev) => [
        ...prev,
        {
          kind: "output",
          text: step.text,
          style: step.style ?? "output",
        },
      ]);
      setTyping(null);
      const pause = reducedMotion
        ? Math.min(step.after ?? 0, 160)
        : step.after ?? 0;
      scheduleTimeout(() => runAt(index + 1), pause);
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        kind: "link",
        lead: step.text,
        label: step.label ?? "",
        href: step.href,
      },
    ]);
    setTyping(null);
    const pause = reducedMotion
      ? Math.min(step.after ?? 0, 160)
      : step.after ?? 0;
    scheduleTimeout(() => runAt(index + 1), pause);
  }

  runAt(0);
}

type BlogTerminalProps = {
  posts: BlogPostJson[];
  /** Drives visibility for the home pager (fixed sections break intersection observers). */
  active: boolean;
};

export default function BlogTerminal({ posts, active }: BlogTerminalProps) {
  const steps = useMemo(() => buildStepsFromPosts(posts), [posts]);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [rows, setRows] = useState<TranscriptRow[]>([]);
  const [typing, setTyping] = useState<{
    full: string;
    visible: number;
  } | null>(null);
  const [complete, setComplete] = useState(false);
  const timeoutIdsRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setInView(active);
  }, [active]);

  useEffect(() => {
    if (!inView) return;

    cancelledRef.current = false;
    timeoutIdsRef.current = [];
    setRows([]);
    setTyping(null);
    setComplete(false);

    const scheduleTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelledRef.current) fn();
      }, ms);
      timeoutIdsRef.current.push(id);
    };

    runAnimatedSequence(
      steps,
      setRows,
      setTyping,
      setComplete,
      scheduleTimeout,
      () => cancelledRef.current,
      reducedMotion,
    );

    return () => {
      cancelledRef.current = true;
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, [steps, reducedMotion, inView]);

  const showIdlePromptLine = complete && rows.length > 0 && !typing;

  return (
    <div ref={rootRef} className="mt-6 w-full">
      <SectionHeading className="mb-3">Blog</SectionHeading>
      <div className="home-term-glass w-full overflow-hidden rounded-lg">
        <div className="home-glass-recess-separator flex items-center gap-2 bg-black/22 px-3 py-2.5 backdrop-blur-sm sm:px-3.5">
          <span className="h-3 w-3 rounded-full border border-[#5a1818] bg-[#3a1010]" />
          <span className="h-3 w-3 rounded-full border border-[#4a3800] bg-[#2e2200]" />
          <span className="h-3 w-3 rounded-full border border-[#007a44] bg-[#004d2a]" />
          <span className="text-home-term-titlebar home-text-xf flex-1 text-center text-[11px] font-mono tracking-[0.08em] sm:text-xs">
            namedotget — blog
          </span>
          <span className="w-[52px] shrink-0 sm:w-[60px]" aria-hidden />
        </div>
        <div className="bg-black/35 px-4 py-6 backdrop-blur-[2px] sm:px-6 sm:py-8">
          <p className="text-home-term-intro-muted home-text-xf mb-5 font-mono text-[13px] leading-[1.45]">
            <span className="text-home-term-cmd home-text-xf">namedotget ~</span>{" "}
            blog --latest
          </p>
          <div
            className="flex min-h-[min(42vh,340px)] flex-col gap-2 overflow-x-auto overflow-y-auto sm:min-h-[280px]"
            aria-live="polite"
          >
            {rows.map((row, i) => (
              <TranscriptRowView
                key={`${i}-${row.kind}-${row.kind === "command" ? row.text : row.kind === "output" ? row.text : row.href}`}
                row={row}
              />
            ))}
            {showIdlePromptLine ? (
              <div className="terminal-line flex min-h-[20px] items-baseline gap-2 font-mono text-[13px] leading-[1.45] sm:text-[13px]">
                <span className="text-home-term-gutter home-text-xf min-w-[20px] shrink-0">
                  &gt;
                </span>
                <span className="text-home-term-out-faint home-text-xf">...</span>
                <span
                  className="blog-term-cursor bg-home-term-cursor home-text-xf ml-0.5 inline-block h-[14px] w-2 align-text-bottom"
                  aria-hidden
                />
              </div>
            ) : null}
            {typing !== null && typing.full.length > 0 ? (
              <div className="terminal-line flex min-h-[20px] items-baseline gap-2 font-mono text-[13px] leading-[1.45] sm:text-[13px]">
                <span className="text-home-term-prompt home-text-xf shrink-0 whitespace-nowrap">
                  {PROMPT}
                </span>
                <span className="text-home-term-cmd home-text-xf whitespace-pre-wrap break-all">
                  {typing.full.slice(0, typing.visible)}
                </span>
                <span
                  className="blog-term-cursor bg-home-term-cursor home-text-xf ml-0.5 inline-block h-[14px] w-2 align-text-bottom"
                  aria-hidden
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
