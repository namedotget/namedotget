import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <div className="my-12 p-4 flex gap-[40%] justify-center">
      <Link
        className="hover:scale-[1.1] transition-all duration-300 opacity-80"
        href="https://github.com/colinmfoster4723"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="/github-mark.png" width={82} height={82} alt="" />
      </Link>
      <Link
        className="hover:scale-[1.1] transition-all duration-300 opacity-80"
        href="https://twitter.com/namedotget"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="/x-logo.png" width={68} height={68} alt="" />
      </Link>
    </div>
  );
}
