import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <div className="my-12 p-4 flex gap-6 justify-center items-center">
      <Link
        className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(80,200,120,0.15)] transition-all duration-300"
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
        className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(80,200,120,0.15)] transition-all duration-300"
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
    </div>
  );
}
