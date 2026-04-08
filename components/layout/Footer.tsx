import Image from "next/image";
import Link from "next/link";

export function Footer({ embedded }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <div className="flex items-center justify-center gap-6 py-2">
        <FooterLinks />
      </div>
    );
  }

  return (
    <div className="mt-8 mb-12 flex items-center justify-center gap-6 p-4 md:mt-10">
      <FooterLinks />
    </div>
  );
}

function FooterLinks() {
  return (
    <>
      <Link
        className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--home-text-accent)_40%,transparent)] hover:bg-white/10 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--home-text-accent)_15%,transparent)]"
        href="https://github.com/namedotget"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/github-mark.png"
          width={32}
          height={32}
          alt="GitHub"
          className="opacity-70 group-hover:opacity-100 transition-opacity duration-300 invert"
        />
      </Link>
      <Link
        className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--home-text-accent)_40%,transparent)] hover:bg-white/10 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--home-text-accent)_15%,transparent)]"
        href="https://twitter.com/namedotget"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/x-logo.png"
          width={32}
          height={32}
          alt="X"
          className="opacity-70 group-hover:opacity-100 transition-opacity duration-300 invert"
        />
      </Link>
    </>
  );
}
