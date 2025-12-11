import { useEffect, useState } from "react";

type QuestionType = "color" | "position" | "comparison";

export function Captcha({ verified, setVerified }: any) {
  const [randomNum1, setRandomNum1] = useState(5);
  const [randomNum2, setRandomNum2] = useState(6);
  const [inputValue, setInputValue] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("color");
  const [isAnimating, setIsAnimating] = useState(false);

  function resetCaptcha() {
    setRandomNum1(Math.floor(Math.random() * 10));
    setRandomNum2(Math.floor(Math.random() * 10));
    setInputValue("");
    setQuestionAnswer("");
    setVerified(false);
    setIsAnimating(true);
    const types: QuestionType[] = ["color", "position", "comparison"];
    setQuestionType(types[Math.floor(Math.random() * types.length)]);
    setTimeout(() => setIsAnimating(false), 300);
  }

  function getQuestionText(): string {
    switch (questionType) {
      case "color":
        return "What color are the numbers?";
      case "position":
        return "Which number is on the left?";
      case "comparison":
        return `Which is larger: ${randomNum1} or ${randomNum2}?`;
      default:
        return "";
    }
  }

  function getCorrectQuestionAnswer(): string {
    switch (questionType) {
      case "color":
        return "green";
      case "position":
        return randomNum1.toString();
      case "comparison":
        return randomNum1 > randomNum2
          ? randomNum1.toString()
          : randomNum2.toString();
      default:
        return "";
    }
  }

  function handleCaptchaChange({ target }: any) {
    const value = target.value.trim();
    setInputValue(value);
    checkVerification(value, questionAnswer);
  }

  function handleQuestionChange({ target }: any) {
    const value = target.value.trim().toLowerCase();
    setQuestionAnswer(value);
    checkVerification(inputValue, value);
  }

  function checkVerification(mathAnswer: string, qAnswer: string) {
    if (mathAnswer === "" || qAnswer === "") {
      setVerified(false);
      return;
    }
    const mathCorrect = parseInt(mathAnswer) === randomNum1 + randomNum2;
    const questionCorrect = qAnswer === getCorrectQuestionAnswer();
    setVerified(mathCorrect && questionCorrect);
  }

  useEffect(() => {
    resetCaptcha();
  }, []);

  const correctAnswer = randomNum1 + randomNum2;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        className={`relative w-full p-4 rounded-lg border transition-all duration-500 ${
          verified
            ? "bg-gradient-to-r from-ndgGreen/20 to-ndgGreen/10 border-ndgGreen/50 shadow-[0_0_20px_rgba(80,200,120,0.2)]"
            : "bg-[#1a1a1a] border-[#3d3d3d] hover:border-ndgGreen/30"
        }`}
      >
        {verified ? (
          <div className="flex items-center justify-center gap-3 animate-in fade-in duration-500">
            <div className="relative">
              <svg
                className="w-6 h-6 text-ndgGreen"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className="animate-in slide-in-from-left-2 duration-300"
                />
              </svg>
            </div>
            <p className="text-ndgGreen font-semibold font-mono">
              Verified! You're human
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-[#e8e8e8] font-mono">
              <span className="text-ndgGreen/60">{"//"}</span>
              <span>Prove you're human:</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div
                className={`text-2xl font-bold text-ndgGreen transition-all duration-300 ${
                  isAnimating ? "scale-125 rotate-12" : ""
                }`}
              >
                {randomNum1}
              </div>
              <span className="text-xl text-[#606060] font-mono">+</span>
              <div
                className={`text-2xl font-bold text-ndgGreen transition-all duration-300 ${
                  isAnimating ? "scale-125 -rotate-12" : ""
                }`}
              >
                {randomNum2}
              </div>
              <span className="text-xl text-[#606060] font-mono">=</span>
              <input
                className={`w-20 px-3 py-2 rounded-lg bg-[#26282b] border text-center text-[#e8e8e8] placeholder:text-[#606060] focus:border-ndgGreen focus:shadow-[0_0_0_1px_rgba(80,200,120,0.2),0_0_10px_rgba(80,200,120,0.1)] focus:outline-none transition-all duration-300 font-mono font-semibold ${
                  inputValue && parseInt(inputValue) !== correctAnswer
                    ? "border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    : "border-[#3d3d3d]"
                }`}
                onChange={handleCaptchaChange}
                value={inputValue}
                placeholder="?"
                type="number"
                maxLength={3}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#3d3d3d]/50">
              <label className="text-xs text-[#606060] text-center font-mono">
                {getQuestionText()}
              </label>
              <input
                className={`w-full px-3 py-2 rounded-lg bg-[#26282b] border text-center text-[#e8e8e8] placeholder:text-[#606060] focus:border-ndgGreen focus:shadow-[0_0_0_1px_rgba(80,200,120,0.2),0_0_10px_rgba(80,200,120,0.1)] focus:outline-none transition-all duration-300 font-mono text-sm ${
                  questionAnswer &&
                  questionAnswer !== getCorrectQuestionAnswer()
                    ? "border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    : "border-[#3d3d3d]"
                }`}
                onChange={handleQuestionChange}
                value={questionAnswer}
                placeholder="Your answer..."
                type="text"
              />
            </div>

            {!verified &&
              ((inputValue && parseInt(inputValue) !== correctAnswer) ||
                (questionAnswer &&
                  questionAnswer !== getCorrectQuestionAnswer())) && (
                <p className="text-xs text-red-400/70 text-center font-mono animate-in fade-in duration-200">
                  {inputValue && parseInt(inputValue) !== correctAnswer
                    ? `Math incorrect. Hint: ${
                        correctAnswer > 10 ? "greater than 10" : "less than 11"
                      }`
                    : questionAnswer &&
                      questionAnswer !== getCorrectQuestionAnswer()
                    ? "Question answer incorrect"
                    : ""}
                </p>
              )}
          </div>
        )}
      </div>
      {!verified && (
        <button
          onClick={resetCaptcha}
          className="text-xs text-[#606060] hover:text-ndgGreen transition-colors duration-300 font-mono flex items-center gap-1 group"
        >
          <svg
            className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>New challenge</span>
        </button>
      )}
    </div>
  );
}
