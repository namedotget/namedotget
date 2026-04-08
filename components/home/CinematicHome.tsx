"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { PixelWaveTransition } from "@/r3f/PixelWaveTransition";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { LightModeContext } from "@/components/layout/Layout";
import type { BlogPostJson } from "@/lib/blogTerminal";
import { setHeroTargetMotionScale } from "@/lib/heroMotionBridge";
import {
  PIXEL_WAVE_DURATION_MS,
  PIXEL_WAVE_DURATION_REDUCED_MS,
} from "@/lib/pixelWaveConfig";

const BlogTerminal = dynamic(() => import("@/components/BlogTerminal"), {
  ssr: false,
  loading: () => <div className="min-h-[200px] w-full" aria-hidden />,
});

const HomeWorkSectionContent = dynamic(
  () =>
    import("@/components/home/HomeWorkSectionContent").then(
      (m) => m.HomeWorkSectionContent,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[min(42vh,280px)] w-full" aria-hidden />
    ),
  },
);

const HomeContactSectionContent = dynamic(
  () =>
    import("@/components/home/HomeContactSectionContent").then(
      (m) => m.HomeContactSectionContent,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[min(42vh,280px)] w-full" aria-hidden />
    ),
  },
);

const SECTION_LABELS = ["Home", "Blog", "Work", "Contact"] as const;

const ARROW_SCROLL_STEP_VH = 0.22;
const ARROW_SCROLL_MIN_STEP_PX = 96;
/** Per-frame approach to target; lower = floatier (60fps-ish). */
const ARROW_SCROLL_LERP = 0.072;

function sectionMaxScrollTop(el: HTMLElement): number {
  return Math.max(0, el.scrollHeight - el.clientHeight);
}

function clampScrollTop(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(max, Math.max(0, value));
}

function stepScrollTowardTarget(
  el: HTMLElement,
  targetTop: number,
  lerp: number,
): boolean {
  const y = el.scrollTop;
  const dist = targetTop - y;
  if (Math.abs(dist) < 0.45) {
    el.scrollTop = targetTop;
    return true;
  }
  el.scrollTop = y + dist * lerp;
  return false;
}

const HERO_ROLES = [
  "Full-Stack Engineer",
  "AI Systems",
  "Web3",
  "Founder",
] as const;

function glassPagerRailStyle(side: "left" | "right"): CSSProperties {
  const hairline =
    "1px solid color-mix(in srgb, var(--home-text-accent) 52%, transparent)";
  const glowOut =
    side === "left"
      ? [
          "-5px 0 22px color-mix(in srgb, var(--home-text-accent) 38%, transparent)",
          "-14px 0 46px color-mix(in srgb, var(--home-text-accent) 20%, transparent)",
          "-26px 0 72px color-mix(in srgb, var(--home-text-accent) 10%, transparent)",
        ].join(", ")
      : [
          "5px 0 22px color-mix(in srgb, var(--home-text-accent) 38%, transparent)",
          "14px 0 46px color-mix(in srgb, var(--home-text-accent) 20%, transparent)",
          "26px 0 72px color-mix(in srgb, var(--home-text-accent) 10%, transparent)",
        ].join(", ");
  const depth =
    side === "left"
      ? "4px 0 36px rgba(0,0,0,0.55)"
      : "-4px 0 36px rgba(0,0,0,0.55)";
  const insetHi =
    side === "left"
      ? "inset -1px 0 0 color-mix(in srgb, var(--home-text-accent) 35%, transparent)"
      : "inset 1px 0 0 color-mix(in srgb, var(--home-text-accent) 35%, transparent)";
  const insetLo =
    side === "left"
      ? "inset -2px 0 14px color-mix(in srgb, var(--home-text-accent) 12%, transparent)"
      : "inset 2px 0 14px color-mix(in srgb, var(--home-text-accent) 12%, transparent)";
  return {
    background:
      "color-mix(in srgb, var(--home-text-accent) 11%, rgba(0,0,0,0.58))",
    backdropFilter: "blur(16px) saturate(120%)",
    WebkitBackdropFilter: "blur(16px) saturate(120%)",
    border: "none",
    ...(side === "left" ? { borderRight: hairline } : { borderLeft: hairline }),
    boxShadow: [glowOut, depth, insetHi, insetLo].join(", "),
  };
}

function shouldDeferArrowScroll(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const el = target.closest(
    "input, textarea, select, [contenteditable='true']",
  );
  return Boolean(el);
}

function SectionDotNav({
  sectionIndex,
  waveActive,
  onSelectSection,
}: {
  sectionIndex: number;
  waveActive: boolean;
  onSelectSection: (index: number) => void;
}) {
  return (
    <nav
      className="pointer-events-auto fixed left-1/2 top-3 z-[94800] flex -translate-x-1/2 items-center gap-2.5 md:top-5 md:gap-3.5"
      aria-label="Section pagination"
    >
      {SECTION_LABELS.map((label, i) => {
        const active = sectionIndex === i;
        return (
          <button
            key={label}
            type="button"
            disabled={waveActive}
            aria-label={`Go to ${label}`}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelectSection(i)}
            className={[
              "relative rounded-full transition-[transform,opacity,box-shadow,background-color,width,height] duration-300",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-text-accent)]",
              active
                ? "h-2.5 w-2.5 scale-110 bg-[var(--home-text-accent)] shadow-[0_0_12px_var(--home-text-accent),0_0_26px_color-mix(in_srgb,var(--home-text-accent)_50%,transparent),0_0_42px_color-mix(in_srgb,var(--home-text-accent)_22%,transparent)] md:h-3 md:w-3"
                : "h-2 w-2 border border-[color-mix(in_srgb,var(--home-text-accent)_38%,transparent)] bg-[color-mix(in_srgb,var(--home-text-accent)_14%,transparent)] opacity-[0.72] enabled:cursor-pointer enabled:hover:border-[color-mix(in_srgb,var(--home-text-accent)_58%,transparent)] enabled:hover:bg-[color-mix(in_srgb,var(--home-text-accent)_26%,transparent)] enabled:hover:opacity-100 enabled:hover:shadow-[0_0_14px_color-mix(in_srgb,var(--home-text-accent)_35%,transparent)] md:h-2.5 md:w-2.5",
              waveActive ? "cursor-not-allowed" : "",
            ].join(" ")}
          />
        );
      })}
    </nav>
  );
}

function SectionChrome({
  index,
  active,
  children,
  className,
  contentClassName,
  sectionRef,
}: {
  index: number;
  active: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={sectionRef}
      aria-hidden={!active}
      aria-label={SECTION_LABELS[index]}
      className={[
        "fixed inset-0 z-[10] overflow-y-auto overflow-x-hidden outline-none transition-opacity duration-150",
        active ? "opacity-100" : "pointer-events-none opacity-0",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex min-h-full w-full max-w-[700px] flex-col px-6 pt-10 md:px-8 md:pt-12",
          "pb-[calc(2.5rem+3rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(3rem+3rem+env(safe-area-inset-bottom,0px))]",
          contentClassName ?? "",
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}

export function CinematicHome({
  blogPosts,
  projects,
  contributions,
  interClassName,
}: {
  blogPosts: BlogPostJson[];
  projects: typeof import("@/lib/config").PROJECTS;
  contributions: typeof import("@/lib/config").CONTRIBUTIONS;
  interClassName: string;
}) {
  const router = useRouter();
  const lightMode = useContext(LightModeContext);
  const accentHex = lightMode ? "#42c98a" : "#50c878";
  const [sectionIndex, setSectionIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [waveDir, setWaveDir] = useState<1 | -1>(1);
  const [waveActive, setWaveActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mountWorkSectionBody, setMountWorkSectionBody] = useState(false);
  const [mountContactSectionBody, setMountContactSectionBody] =
    useState(false);
  const pendingDeltaRef = useRef<1 | -1>(1);
  const animatingRef = useRef(false);
  const sectionScrollElsRef = useRef<(HTMLElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const arrowScrollRafRef = useRef<number | null>(null);
  const arrowScrollTargetRef = useRef<number | null>(null);
  const arrowScrollSectionRef = useRef(0);

  const bindSectionScrollRef = useCallback((i: number) => {
    return (node: HTMLElement | null) => {
      sectionScrollElsRef.current[i] = node;
    };
  }, []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(rm.matches);
    const onChange = () => setPrefersReducedMotion(rm.matches);
    rm.addEventListener("change", onChange);
    return () => rm.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setHeroTargetMotionScale(sectionIndex === 0 ? 1 : 0.22);
  }, [sectionIndex]);

  useEffect(() => {
    if (sectionIndex === 2) setMountWorkSectionBody(true);
    if (sectionIndex === 3) setMountContactSectionBody(true);
  }, [sectionIndex]);

  useEffect(() => {
    if (arrowScrollRafRef.current !== null) {
      cancelAnimationFrame(arrowScrollRafRef.current);
      arrowScrollRafRef.current = null;
    }
    arrowScrollTargetRef.current = null;
  }, [sectionIndex]);

  const durationMs = prefersReducedMotion
    ? PIXEL_WAVE_DURATION_REDUCED_MS
    : PIXEL_WAVE_DURATION_MS;

  const startTransition = useCallback((delta: 1 | -1) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    pendingDeltaRef.current = delta;
    setWaveDir(delta);
    setRunId((r) => r + 1);
    setWaveActive(true);
  }, []);

  const onWaveMid = useCallback(() => {
    const len = SECTION_LABELS.length;
    setSectionIndex((s) => (s + pendingDeltaRef.current + len) % len);
  }, []);

  const onWaveEnd = useCallback(() => {
    setWaveActive(false);
    animatingRef.current = false;
  }, []);

  const selectSection = useCallback(
    (i: number) => {
      if (waveActive || i === sectionIndex) return;
      const delta = i - sectionIndex;
      if (delta === 1) {
        startTransition(1);
        return;
      }
      if (delta === -1) {
        startTransition(-1);
        return;
      }
      setSectionIndex(i);
    },
    [waveActive, sectionIndex, startTransition],
  );

  useEffect(() => {
    const tickArrowScroll = () => {
      arrowScrollRafRef.current = null;
      const idx = arrowScrollSectionRef.current;
      const scroller = sectionScrollElsRef.current[idx];
      let target = arrowScrollTargetRef.current;
      if (!scroller || target === null) return;

      const max = sectionMaxScrollTop(scroller);
      target = clampScrollTop(target, max);
      arrowScrollTargetRef.current = target;

      const done = stepScrollTowardTarget(
        scroller,
        target,
        ARROW_SCROLL_LERP,
      );
      if (done) {
        arrowScrollTargetRef.current = null;
        return;
      }
      arrowScrollRafRef.current = requestAnimationFrame(tickArrowScroll);
    };

    const scheduleArrowScroll = () => {
      if (arrowScrollRafRef.current !== null) return;
      arrowScrollRafRef.current = requestAnimationFrame(tickArrowScroll);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        startTransition(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        startTransition(-1);
        return;
      }
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      if (shouldDeferArrowScroll(e.target)) return;

      const scroller = sectionScrollElsRef.current[sectionIndex];
      if (!scroller) return;

      const max = sectionMaxScrollTop(scroller);
      if (max <= 0) return;

      const step = Math.max(
        ARROW_SCROLL_MIN_STEP_PX,
        Math.round(window.innerHeight * ARROW_SCROLL_STEP_VH),
      );
      const delta = e.key === "ArrowDown" ? step : -step;
      e.preventDefault();

      if (prefersReducedMotion) {
        scroller.scrollTop = clampScrollTop(scroller.scrollTop + delta, max);
        arrowScrollTargetRef.current = null;
        if (arrowScrollRafRef.current !== null) {
          cancelAnimationFrame(arrowScrollRafRef.current);
          arrowScrollRafRef.current = null;
        }
        return;
      }

      arrowScrollSectionRef.current = sectionIndex;
      let nextTarget = arrowScrollTargetRef.current;
      if (nextTarget === null) nextTarget = scroller.scrollTop;
      arrowScrollTargetRef.current = clampScrollTop(nextTarget + delta, max);
      scheduleArrowScroll();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (arrowScrollRafRef.current !== null) {
        cancelAnimationFrame(arrowScrollRafRef.current);
        arrowScrollRafRef.current = null;
      }
    };
  }, [startTransition, sectionIndex, prefersReducedMotion]);

  return (
    <main className={`relative min-h-0 ${interClassName}`}>
      <SectionDotNav
        sectionIndex={sectionIndex}
        waveActive={waveActive}
        onSelectSection={selectSection}
      />
      <SectionChrome
        index={0}
        active={sectionIndex === 0}
        contentClassName="justify-center items-center"
        sectionRef={bindSectionScrollRef(0)}
      >
        <div className="relative mx-auto flex w-full max-w-[min(100%,26rem)] flex-col items-stretch px-2 md:max-w-xl md:px-0">
          <div
            className="pointer-events-none home-hero-ambient absolute left-1/2 top-[18%] h-[min(55vw,280px)] w-[min(92vw,420px)] -translate-x-1/2 rounded-full opacity-50 blur-[64px] md:top-[12%] md:h-[320px] md:w-[480px]"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in srgb, var(--home-text-accent) 42%, transparent) 0%, transparent 68%)",
            }}
            aria-hidden
          />
          <div className="home-hero-animate home-hero-card-glass relative flex flex-col gap-3 rounded-none px-0 py-0 md:gap-4 md:rounded-3xl md:px-10 md:py-10">
            <div className="home-hero-inner-panel px-3 py-3 md:px-4 md:py-3.5">
              <div className="flex items-center gap-0 home-section-heading">
                <span className="home-section-heading__label">
                  Systems & product
                </span>
              </div>
            </div>
            <div className="home-hero-inner-panel px-4 py-5 md:px-6 md:py-6">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="group home-text-xf text-center text-[clamp(1.65rem,7vw,3.35rem)] font-bold leading-[1.08] tracking-tight text-[#e8e8e8] drop-shadow-[0_0_24px_rgba(0,0,0,0.65)] transition-[transform,filter] duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--home-text-accent)] active:scale-[0.99]"
                  onClick={() => router.push("/")}
                >
                  <span className="relative inline-block rounded-md bg-[color-mix(in_srgb,var(--home-text-accent)_92%,#0a2a18)] px-2 py-0.5 shadow-[0_0_28px_color-mix(in_srgb,var(--home-text-accent)_35%,transparent)] md:rounded-lg md:px-2.5">
                    name
                  </span>
                  <span className="text-home-body-alt transition-colors duration-300 group-hover:text-[var(--home-text-accent-hover)]">
                    .get
                  </span>
                  <span className="align-super text-[0.45em] font-semibold text-home-muted opacity-90">
                    ™
                  </span>
                </button>
                <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2 md:mt-6">
                  {HERO_ROLES.map((role) => (
                    <span
                      key={role}
                      className="home-text-xf rounded-full border border-[color-mix(in_srgb,var(--home-text-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--home-text-accent)_9%,transparent)] px-3 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-home-body md:text-[0.7rem]"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-home-body md:mt-7 md:text-[0.95rem]">
                  I build products end-to-end, from iOS apps to DAOs, from AI
                  pipelines to pixel-art worlds, from local hardware clusters to
                  planet-scale React apps.
                </p>
              </div>
            </div>
            <div className="home-hero-inner-panel px-4 py-4 md:px-5 md:py-5">
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  disabled={waveActive}
                  onClick={() => startTransition(1)}
                  className="home-text-xf group flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--home-text-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--home-text-accent)_14%,rgba(0,0,0,0.35))] px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--home-text-accent)] shadow-[0_0_24px_color-mix(in_srgb,var(--home-text-accent)_18%,transparent)] transition-[transform,box-shadow,border-color] duration-300 enabled:cursor-pointer enabled:hover:border-[var(--home-text-accent-hover)] enabled:hover:text-[var(--home-text-accent-hover)] enabled:hover:shadow-[0_0_32px_color-mix(in_srgb,var(--home-text-accent)_26%,transparent)] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Continue</span>
                  <span
                    aria-hidden
                    className="text-home-chevron transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </button>
                <div
                  className="flex items-center gap-2"
                  role="presentation"
                  aria-hidden
                >
                  {SECTION_LABELS.map((_, i) => (
                    <span
                      key={SECTION_LABELS[i]}
                      className={[
                        "h-1.5 rounded-full transition-all duration-300",
                        i === 0
                          ? "w-6 bg-[var(--home-text-accent)] shadow-[0_0_12px_color-mix(in_srgb,var(--home-text-accent)_45%,transparent)]"
                          : "w-1.5 bg-[color-mix(in_srgb,var(--home-text-muted)_55%,transparent)]",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <p className="max-w-[20rem] text-center font-mono text-[0.68rem] leading-snug text-home-muted md:text-xs">
                  {`arrow left/right: sections.`}
                  <br /> {`arrow up/down: scroll.`}
                  <br /> {`side rails: sections.`}
                  <br /> {`bottom: enable ambient sound.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionChrome>

      <SectionChrome
        index={1}
        active={sectionIndex === 1}
        sectionRef={bindSectionScrollRef(1)}
      >
        <BlogTerminal posts={blogPosts} active={sectionIndex === 1} />
      </SectionChrome>

      <SectionChrome
        index={2}
        active={sectionIndex === 2}
        sectionRef={bindSectionScrollRef(2)}
      >
        {mountWorkSectionBody ? (
          <HomeWorkSectionContent
            projects={projects}
            contributions={contributions}
          />
        ) : (
          <div className="min-h-[min(42vh,280px)] w-full" aria-hidden />
        )}
      </SectionChrome>

      <SectionChrome
        index={3}
        active={sectionIndex === 3}
        sectionRef={bindSectionScrollRef(3)}
      >
        {mountContactSectionBody ? (
          <HomeContactSectionContent
            waveActive={waveActive}
            onBackToIntro={() => selectSection(0)}
          />
        ) : (
          <div className="min-h-[min(42vh,280px)] w-full" aria-hidden />
        )}
      </SectionChrome>

      <PixelWaveTransition
        runId={runId}
        active={waveActive}
        direction={waveDir}
        accentHex={accentHex}
        durationMs={durationMs}
        onMid={onWaveMid}
        onEnd={onWaveEnd}
      />

      <nav className="contents" aria-label="Sections">
        <span className="sr-only">
          {SECTION_LABELS[sectionIndex]} &mdash; left and right or side rails
          for sections; up and down to scroll
        </span>
        <button
          type="button"
          disabled={waveActive}
          onClick={() => startTransition(-1)}
          className={[
            "home-pager-rail home-pager-rail--left pointer-events-auto fixed bottom-0 left-0 top-[50vh] z-[95000] flex w-[32px] md:w-[52px] items-center justify-center overflow-hidden rounded-r-2xl font-mono text-xl transition enabled:cursor-pointer enabled:hover:bg-white/[0.07] disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-text-accent)] md:w-[60px] md:text-2xl md:rounded-r-3xl",
            waveActive ? "home-pager-rail--subdued disabled:opacity-30" : "",
          ].join(" ")}
          style={glassPagerRailStyle("left")}
          aria-label="Previous section"
        >
          <span className="home-pager-rail__chevron" aria-hidden>
            ‹
          </span>
        </button>
        <button
          type="button"
          disabled={waveActive}
          onClick={() => startTransition(1)}
          className={[
            "home-pager-rail home-pager-rail--right pointer-events-auto fixed bottom-0 right-0 top-[50vh] z-[95000] flex w-[32px] md:w-[52px] items-center justify-center overflow-hidden rounded-l-2xl font-mono text-xl transition enabled:cursor-pointer enabled:hover:bg-white/[0.07] disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-text-accent)] md:w-[60px] md:text-2xl md:rounded-l-3xl",
            waveActive ? "home-pager-rail--subdued disabled:opacity-30" : "",
          ].join(" ")}
          style={glassPagerRailStyle("right")}
          aria-label="Next section"
        >
          <span className="home-pager-rail__chevron" aria-hidden>
            ›
          </span>
        </button>
      </nav>
    </main>
  );
}
