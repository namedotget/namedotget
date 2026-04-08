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
    <>
      <div className="home-hero-inner-panel mt-10 px-5 py-6 text-center md:mt-14 md:px-7 md:py-7">
        <p className="home-text-xf text-sm leading-relaxed text-home-body md:text-[0.95rem]">
          Thanks for your time. Have a great day!
        </p>
        <button
          type="button"
          disabled={waveActive}
          onClick={onBackToIntro}
          className="home-text-xf mt-5 inline-flex items-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--home-text-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--home-text-accent)_10%,rgba(0,0,0,0.25))] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--home-text-accent)] shadow-[0_0_18px_color-mix(in_srgb,var(--home-text-accent)_15%,transparent)] transition-[transform,box-shadow,border-color] duration-300 enabled:cursor-pointer enabled:hover:border-[var(--home-text-accent-hover)] enabled:hover:text-[var(--home-text-accent-hover)] enabled:hover:shadow-[0_0_24px_color-mix(in_srgb,var(--home-text-accent)_22%,transparent)] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 md:mt-6 md:px-5 md:text-xs"
        >
          <span aria-hidden>←</span>
          <span>Back to intro</span>
        </button>
      </div>
      <Contact />
      <Footer />
    </>
  );
}
