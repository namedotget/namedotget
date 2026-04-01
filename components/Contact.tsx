import Link from "next/link";

export function Contact() {
  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <h1 className="font-bold text-2xl text-center text-[#00000080]">
        Contact:
      </h1>
      <div className="p-5 glass rounded-lg card-glow">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-center text-[#d0d0d0]">
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
            className="text-center text-sm text-[#606060] hover:text-ndgGreen transition-colors duration-300"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
