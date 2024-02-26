import { useEffect, useState } from "react";

export function Captcha({ verified, setVerified }: any) {
  const [randomNum1, setRandomNum1] = useState(5);
  const [randomNum2, setRandomNum2] = useState(6);

  function resetCaptcha() {
    setRandomNum1(Math.floor(Math.random() * 10));
    setRandomNum2(Math.floor(Math.random() * 10));
  }

  function handleCaptchaChange({ target }: any) {
    if (target.value.trim() === "") return;
    if (parseInt(target.value) === randomNum1 + randomNum2) {
      setVerified(true);
    }
  }

  useEffect(() => {
    resetCaptcha();
  }, []);

  return (
    <div
      className={`w-3/4 p-2 flex justify-center gap-4 text-black rounded-md ${
        verified ? "bg-ndgGreen" : "bg-[#ffffff75]"
      }`}
    >
      {verified ? (
        <p>{`You're not a robot!`}</p>
      ) : (
        <>
          <p>{`I'm not a robot: ${randomNum1} + ${randomNum2} =  `}</p>
          <input className="w-24 px-2" onChange={handleCaptchaChange} />
        </>
      )}
    </div>
  );
}
