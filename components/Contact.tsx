import Link from "next/link";

import { SectionHeading } from "@/components/SectionHeading";

export function Contact() {
  return (
    <div className="mt-6 flex w-full flex-col justify-center gap-3">
      <SectionHeading as="h2">Contact</SectionHeading>
      <div className="home-term-glass card-glow rounded-lg p-5">
        <div className="flex flex-col items-center gap-4">
          <p className="text-home-body-alt home-text-xf text-center">
            For inquiries, email me directly.
          </p>
          <a
            className="group relative w-full overflow-hidden rounded-lg bg-ndgGreen/90 py-3 text-center font-semibold text-[#1a1a1a] transition-all duration-300 hover:bg-ndgGreen hover:shadow-[0_0_20px_rgba(80,200,120,0.3)] active:scale-[0.98] home-text-xf"
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
