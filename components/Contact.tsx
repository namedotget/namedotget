import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Captcha } from "./Captcha";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [verified, setVerified] = useState(false);

  function resetContactForm() {
    setName("");
    setEmail("");
    setMessage("");
    setVerified(false);
  }

  async function submitContactForm() {
    if (!email.includes("@") || message.trim() === "")
      return toast.error("Please fill out all required fields.");
    if (!verified) return toast.error("Please verify you're not a robot.");
    else {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            message,
          }),
        });
        toast.success("Message sent!");
        resetContactForm();
      } catch (e: any) {
        toast.error("Message failed to send.");
        console.error(e);
      }
    }
  }

  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <h1 className="font-bold text-2xl text-center text-[#00000080]">
        Contact:
      </h1>
      <div className="p-5 glass rounded-lg card-glow">
        <div className="flex flex-col gap-4">
          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-sm text-ndgGreen mb-1.5 font-mono">
              <span
                className={`text-ndgGreen/60 transition-transform duration-200 ${
                  focused === "name" ? "translate-x-1" : ""
                }`}
              >
                {">"}
              </span>
              Name
            </label>
            <input
              className="w-full rounded-lg px-4 py-2.5 bg-[#1a1a1a] border border-[#3d3d3d] text-[#e8e8e8] placeholder:text-[#606060] focus:border-ndgGreen focus:shadow-[0_0_0_1px_rgba(80,200,120,0.2),0_0_15px_rgba(80,200,120,0.1)] focus:outline-none transition-all duration-300 font-mono"
              onChange={({ target }) => setName(target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              value={name}
              placeholder="Your name"
            />
          </div>

          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-sm text-ndgGreen mb-1.5 font-mono">
              <span
                className={`text-ndgGreen/60 transition-transform duration-200 ${
                  focused === "email" ? "translate-x-1" : ""
                }`}
              >
                {">"}
              </span>
              Email
              <span className="text-red-400/80 text-xs">*</span>
            </label>
            <input
              className="w-full rounded-lg px-4 py-2.5 bg-[#1a1a1a] border border-[#3d3d3d] text-[#e8e8e8] placeholder:text-[#606060] focus:border-ndgGreen focus:shadow-[0_0_0_1px_rgba(80,200,120,0.2),0_0_15px_rgba(80,200,120,0.1)] focus:outline-none transition-all duration-300 font-mono"
              onChange={({ target }) => setEmail(target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              value={email}
              placeholder="your@email.com"
            />
          </div>

          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-sm text-ndgGreen mb-1.5 font-mono">
              <span
                className={`text-ndgGreen/60 transition-transform duration-200 ${
                  focused === "message" ? "translate-x-1" : ""
                }`}
              >
                {">"}
              </span>
              Message
              <span className="text-red-400/80 text-xs">*</span>
            </label>
            <textarea
              className="w-full h-32 rounded-lg px-4 py-2.5 bg-[#1a1a1a] border border-[#3d3d3d] text-[#e8e8e8] placeholder:text-[#606060] focus:border-ndgGreen focus:shadow-[0_0_0_1px_rgba(80,200,120,0.2),0_0_15px_rgba(80,200,120,0.1)] focus:outline-none transition-all duration-300 resize-none font-mono"
              onChange={({ target }) => setMessage(target.value)}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              value={message}
              placeholder="Your message..."
            />
          </div>

          {email.includes("@") && message.trim() !== "" && (
            <div className="flex justify-center">
              <Captcha verified={verified} setVerified={setVerified} />
            </div>
          )}

          <button
            className="group relative w-full bg-ndgGreen/90 text-[#1a1a1a] font-semibold hover:bg-ndgGreen hover:shadow-[0_0_20px_rgba(80,200,120,0.3)] active:scale-[0.98] transition-all duration-300 rounded-lg py-3 overflow-hidden font-mono"
            onClick={submitContactForm}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Send Message
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                {"->"}
              </span>
            </span>
          </button>

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
