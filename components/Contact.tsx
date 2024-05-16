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

  return (
    <>
      <h1 className="mt-4 font-bold text-2xl text-center text-[#00000080]">
        {"Contact:"}
      </h1>
      <div className="mt-2 p-4 w-full flex flex-col items-center gap-2 md:w-1/2 glass h-full bg-[#1d1d1d] rounded-md text-ndgGreen">
        <div className="w-full">
          <label className="font-semibold">Name :</label>
          <input
            className="w-full rounded-md px-2 bg-[#ffffff25]"
            onChange={({ target }) => setName(target.value)}
            value={name}
          />
        </div>
        <div className="w-full">
          <label className="font-semibold">
            Email<span className="text-[tomato]">*</span> :
          </label>
          <input
            className="w-full rounded-md px-2 bg-[#ffffff25]"
            onChange={({ target }) => setEmail(target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <label className="font-semibold">
            Message<span className="text-[tomato]">*</span> :
          </label>
          <textarea
            className="w-full h-32 rounded-md px-2 bg-[#ffffff25]"
            onChange={({ target }) => setMessage(target.value)}
            style={{ resize: "none" }}
            value={message}
          ></textarea>
        </div>
        {email.includes("@") && message.trim() !== "" && (
          <Captcha verified={verified} setVerified={setVerified} />
        )}
        <button
          className="w-3/4 bg-ndgGreen text-black hover:scale-105 transition-all duration-300 rounded-md p-2"
          onClick={submitContactForm}
        >
          Submit
        </button>

        <Link className="mt-2" href="/privacy">
          Privacy Policy
        </Link>
      </div>
    </>
  );
}
