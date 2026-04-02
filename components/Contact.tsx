import Link from "next/link";

import { SectionHeading } from "@/components/SectionHeading";

export function Contact() {
  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <SectionHeading as="h2">Contact</SectionHeading>
      <div className="home-term-glass card-glow rounded-lg p-5">
        <div className="flex flex-col items-center gap-4">
          <p className="text-home-body-alt home-text-xf text-center">
            For inquiries, email me directly.
          </p>
          <a
            className="group relative w-full text-center bg-ndgGreen/90 text-[#1a1a1a] font-semibold hover:bg-ndgGreen hover:shadow-[0_0_20px_rgba(80,200,120,0.3)] active:scale-[0.98] transition-all duration-300 rounded-lg py-3 overflow-hidden font-mono"
            href="mailto:colin.foster4723@gmail.com"
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
              Send Email
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                {"->"}
              </span>
            </span>
          </a>
          <Link
            className="text-home-muted home-text-xf text-home-muted-link text-center text-sm"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
