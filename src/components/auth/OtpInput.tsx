"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ length = 6, onChange, disabled = false }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const update = (newDigits: string[]) => {
    setDigits(newDigits);
    onChange(newDigits.join(""));
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        update(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    update(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="ab-otp__wrap">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          className="ab-otp__box"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Kod ${i + 1}. hane`}
        />
      ))}
    </div>
  );
}
