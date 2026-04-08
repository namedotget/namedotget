import { Contact } from "@/components/Contact";
import { Footer } from "@/components/layout/Footer";

export function HomeContactSectionContent({
  waveActive,
  onBackToIntro,
}: {
  waveActive: boolean;
  onBackToIntro: () => void;
}) {
  return (
    <div className="relative mx-auto mt-10 flex w-full max-w-[min(100%,26rem)] flex-col items-stretch px-2 md:mt-14 md:max-w-xl md:px-0">
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
            <span className="home-section-heading__label">Until next time</span>
          </div>
        </div>
        <div className="home-hero-inner-panel px-4 py-5 md:px-6 md:py-7">
          <div className="flex flex-col items-center gap-6 text-center md:gap-7">
            <p className="home-text-xf max-w-md text-sm leading-relaxed text-home-body md:text-[0.95rem]">
              Have a great day. Reach out anytime below.
            </p>
            <button
              type="button"
              disabled={waveActive}
              onClick={onBackToIntro}
              className="home-text-xf group mt-1 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--home-text-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--home-text-accent)_14%,rgba(0,0,0,0.35))] px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--home-text-accent)] shadow-[0_0_24px_color-mix(in_srgb,var(--home-text-accent)_18%,transparent)] transition-[transform,box-shadow,border-color] duration-300 enabled:cursor-pointer enabled:hover:border-[var(--home-text-accent-hover)] enabled:hover:text-[var(--home-text-accent-hover)] enabled:hover:shadow-[0_0_32px_color-mix(in_srgb,var(--home-text-accent)_26%,transparent)] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                aria-hidden
                className="text-home-chevron transition-transform duration-300 group-hover:-translate-x-0.5"
              >
                ←
              </span>
              <span>Back to intro</span>
            </button>
          </div>
        </div>
        <div className="home-hero-inner-panel px-4 py-5 md:px-6 md:py-6">
          <Contact embedded />
        </div>
        <div className="home-hero-inner-panel px-4 py-4 md:px-5 md:py-5">
          <Footer embedded />
        </div>
      </div>
    </div>
  );
}
