"use client";

import { useState } from "react";
import {
  WashingMachine,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

type Step = 1 | 2 | 3;

// Mock: accepted reset codes for demo purposes
const MOCK_VALID_CODE = "123456";

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1 — enter email + code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2 — new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Abandon confirmation modal (steps 1 & 2 only)
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleStep1Submit = () => {
    if (!email.trim()) {
      setStep1Error("Please enter your email address.");
      return;
    }
    if (!code.trim()) {
      setStep1Error("Please enter the reset code.");
      return;
    }
    if (code.trim() !== MOCK_VALID_CODE) {
      setStep1Error("Invalid reset code. (Demo code: 123456)");
      return;
    }
    setStep1Error(null);
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!newPassword.trim()) {
      setStep2Error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setStep2Error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStep2Error("Passwords do not match.");
      return;
    }
    setStep2Error(null);

    // Persist prefill data for Login page auto-fill
    sessionStorage.setItem("prefill_email", email);
    sessionStorage.setItem("prefill_password", newPassword);
    sessionStorage.setItem("reset_success", "true");

    setStep(3);
  };

  const handleBackAttempt = () => {
    // Step 3 success — no confirmation needed
    if (step === 3) {
      onBack();
      return;
    }
    // Steps 1 & 2 — show abandon modal
    setShowAbandonModal(true);
  };

  const handleConfirmAbandon = () => {
    setShowAbandonModal(false);
    onBack();
  };

  // ── Shared card wrapper ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c249c] px-4">
      {/* Subtle dot pattern */}
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
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          {/* ── Step 1: Enter Email + Code ───────────────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-base font-semibold text-foreground text-center mb-2">Reset Password</h1>
              <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                Enter your email and the reset code sent to your inbox.
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
                    onKeyDown={(e) => e.key === "Enter" && handleStep1Submit()}
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-code" className="text-xs font-medium text-foreground">Reset Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fp-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setStep1Error(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleStep1Submit()}
                      className="pl-9 tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Demo code: <span className="font-semibold">123456</span></p>
                </div>

                <Button className="w-full cursor-pointer" onClick={handleStep1Submit}>
                  Continue
                </Button>

                <button
                  type="button"
                  onClick={handleBackAttempt}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: New Password ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              <h1 className="text-base font-semibold text-foreground text-center mb-2">Set New Password</h1>
              <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                Create a strong new password for your account.
              </p>

              {step2Error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
                  {step2Error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-new" className="text-xs font-medium text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="fp-new"
                      type={showNew ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setStep2Error(null); }}
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
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp-confirm" className="text-xs font-medium text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="fp-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setStep2Error(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleStep2Submit()}
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

                <Button className="w-full cursor-pointer" onClick={handleStep2Submit}>
                  Save New Password
                </Button>

                <button
                  type="button"
                  onClick={handleBackAttempt}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Success ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Password Reset Successful!</h1>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Your password has been updated. Click below to log in &mdash; your new credentials have been filled in automatically.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 w-full justify-center">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                For security, all other sessions have been logged out.
              </div>
              <Button className="w-full cursor-pointer" onClick={handleBackAttempt}>
                Back to Login
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>

      {/* Abandon confirmation modal */}
      <AlertDialog open={showAbandonModal} onOpenChange={setShowAbandonModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Your reset progress will be lost. You will need to start over.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmAbandon}
            >
              Back to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
