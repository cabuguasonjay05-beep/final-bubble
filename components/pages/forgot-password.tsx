"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WashingMachine,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authenticateAdmin } from "@/lib/auth";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

type Step = 1 | 2 | 3 | "success";

const MOCK_VALID_CODE = "123456";
const RESEND_COUNTDOWN = 60;

// Mask email: cab***@gmail.com
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

// Password strength helpers
function getStrength(pw: string): { score: 0 | 1 | 2 | 3; labels: string[] } {
  const checks = [
    pw.length >= 8,
    /[0-9]/.test(pw),
    /[A-Z]/.test(pw),
  ];
  const score = checks.filter(Boolean).length as 0 | 1 | 2 | 3;
  return { score, labels: checks.map((c, i) => (c ? "met" : ["length", "number", "uppercase"][i])) };
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Step 2 — 6 separate digit boxes
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Success auto-redirect
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // ── Countdown timer for resend ─────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (step === 2) startCountdown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, startCountdown]);

  // ── Auto-redirect countdown on success ────────────────────────────────────
  useEffect(() => {
    if (step !== "success") return;
    const t = setInterval(() => {
      setRedirectCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          onBack();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, onBack]);

  // ── Step 1: Send reset code ────────────────────────────────────────────────
  const handleSendCode = async () => {
    if (!email.trim()) {
      setStep1Error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep1Error("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setStep1Error(null);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);

    // For demo, only registered admin emails work
    const found = authenticateAdmin(email.trim(), "__any__") !== null ||
      ["admin@laundrytrack.ph", "owner@laundrytrack.ph"].includes(email.trim().toLowerCase());

    if (!found) {
      setStep1Error("No account found with this email address.");
      return;
    }

    toast({ title: "Reset code sent to your email!" });
    setTimeout(() => setStep(2), 1000);
  };

  // ── Step 2: Verify code ────────────────────────────────────────────────────
  const handleVerifyCode = () => {
    const code = digits.join("");
    if (code.length < 6) {
      triggerShake("Please enter the complete 6-digit code.");
      return;
    }
    if (code !== MOCK_VALID_CODE) {
      triggerShake("Invalid code. Please try again.");
      return;
    }
    setStep2Error(null);
    setStep(3);
  };

  const triggerShake = (msg: string) => {
    setStep2Error(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setStep2Error(null);
    if (char && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyCode();
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      digitRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleResend = () => {
    if (!canResend) return;
    toast({ title: "New code sent!" });
    setDigits(Array(6).fill(""));
    setStep2Error(null);
    startCountdown();
    digitRefs.current[0]?.focus();
  };

  // ── Step 3: Set new password ───────────────────────────────────────────────
  const { score: strengthScore } = getStrength(newPassword);
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strengthScore];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][strengthScore];

  const handleResetPassword = () => {
    if (!newPassword) {
      setStep3Error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setStep3Error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStep3Error("Passwords do not match.");
      return;
    }
    setStep3Error(null);
    sessionStorage.setItem("prefill_email", email);
    sessionStorage.setItem("prefill_password", newPassword);
    sessionStorage.setItem("reset_success", "true");
    setStep("success");
  };

  // ── Shared wrapper ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c249c] px-4">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          {/* ── STEP 1: Enter Email ─────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-base font-semibold text-foreground text-center mb-1">Forgot Password</h1>
              <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                Enter your email address and we&apos;ll send you a reset code.
              </p>

              {step1Error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
                  {step1Error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-email" className="text-xs font-medium text-foreground">Email Address</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder="admin@laundrytrack.ph"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStep1Error(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    autoComplete="email"
                    disabled={sending}
                  />
                </div>

                <Button className="w-full cursor-pointer" onClick={handleSendCode} disabled={sending}>
                  {sending ? "Sending..." : "Send Reset Code"}
                </Button>

                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Verify Code ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1.5 mb-5 text-[11px] text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
                <div className="w-6 h-px bg-primary" />
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</span>
                <div className="w-6 h-px bg-muted-foreground/30" />
                <span className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px] font-medium text-muted-foreground">3</span>
              </div>

              <h1 className="text-base font-semibold text-foreground text-center mb-1">Check Your Email</h1>
              <p className="text-xs text-muted-foreground text-center mb-1 leading-relaxed">
                We sent a 6-digit code to
              </p>
              <p className="text-xs font-semibold text-foreground text-center mb-5">{maskEmail(email)}</p>

              {step2Error && (
                <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
                  {step2Error}
                </div>
              )}

              {/* 6-box code input */}
              <div
                className={`flex gap-2 justify-center mb-5 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
                style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
              >
                <style>{`
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-6px); }
                    40% { transform: translateX(6px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                  }
                `}</style>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={handleDigitPaste}
                    className={`w-10 h-12 text-center text-base font-bold rounded-lg border-2 bg-background text-foreground outline-none transition-colors
                      ${d ? "border-primary" : "border-border"}
                      focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground text-center mb-4">
                Demo code: <span className="font-semibold text-foreground">123456</span>
              </p>

              <div className="flex flex-col gap-3">
                <Button className="w-full cursor-pointer" onClick={handleVerifyCode}>
                  Verify Code
                </Button>

                {/* Resend section */}
                <p className="text-xs text-muted-foreground text-center">
                  Didn&apos;t receive a code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-primary font-medium hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      Resend in 0:{String(countdown).padStart(2, "0")}
                    </span>
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => { setDigits(Array(6).fill("")); setStep(1); }}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Set New Password ─────────────────────────────────── */}
          {step === 3 && (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1.5 mb-5 text-[11px] text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
                <div className="w-6 h-px bg-primary" />
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</span>
                <div className="w-6 h-px bg-primary" />
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">3</span>
              </div>

              <h1 className="text-base font-semibold text-foreground text-center mb-1">Set New Password</h1>
              <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                Create a strong new password for your account.
              </p>

              {step3Error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
                  {step3Error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-new" className="text-xs font-medium text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="fp-new"
                      type={showNew ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setStep3Error(null); }}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-1">
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${strengthScore >= level ? strengthColor : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      {strengthLabel && (
                        <p className={`text-[11px] font-medium mb-1.5
                          ${strengthScore === 1 ? "text-red-500" : strengthScore === 2 ? "text-yellow-500" : "text-green-600"}`}>
                          {strengthLabel}
                        </p>
                      )}
                      <ul className="space-y-0.5">
                        {[
                          { met: newPassword.length >= 8, text: "At least 8 characters" },
                          { met: /[0-9]/.test(newPassword), text: "Contains a number" },
                          { met: /[A-Z]/.test(newPassword), text: "Contains uppercase letter" },
                        ].map(({ met, text }) => (
                          <li key={text} className={`text-[11px] flex items-center gap-1 ${met ? "text-green-600" : "text-muted-foreground"}`}>
                            <span>{met ? "✓" : "○"}</span> {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-confirm" className="text-xs font-medium text-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="fp-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setStep3Error(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full cursor-pointer" onClick={handleResetPassword}>
                  Reset Password
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>
            </>
          )}

          {/* ── SUCCESS ─────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Password Reset Successful!</h1>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 w-full justify-center">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                For security, all other sessions have been logged out.
              </div>
              <Button className="w-full cursor-pointer" onClick={onBack}>
                Back to Login
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Redirecting to login in {redirectCountdown}...
              </p>
            </div>
          )}

        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
