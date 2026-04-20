"use client";

import { useState } from "react";
import { Eye, EyeOff, WashingMachine, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StaffLoginPageProps {
  onLogin: (credentials: { login: string; password: string }) => Promise<void> | void;
  onSwitchToAdmin: () => void;
  authConfigured?: boolean;
}

export default function StaffLoginPage({
  onLogin,
  onSwitchToAdmin,
  authConfigured = true,
}: StaffLoginPageProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await onLogin({
        login,
        password,
      });
      setError(null);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleLogin();
    }
  };

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center bg-[#0c249c] px-4">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          <h1 className="text-base font-semibold text-foreground text-center mb-6">Staff Login</h1>

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
              {error}
            </div>
          )}

          {!authConfigured && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              Supabase staff auth is not configured yet, so this page uses the built-in demo accounts.
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-username" className="text-xs font-medium text-foreground">
                Username or Email
              </Label>
              <Input
                id="staff-username"
                type="text"
                placeholder="staff01"
                value={login}
                onChange={(e) => { setLogin(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                className={error && !login.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-password" className="text-xs font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  className={`pr-10 ${error && !password.trim() ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Staff note */}
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Staff accounts are created by the Admin only. Contact your manager if you need access.
            </p>

            {/* Login button */}
            <Button className="w-full cursor-pointer" onClick={() => void handleLogin()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </Button>

            {/* Demo credentials hint */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <span>&#128273; Demo Credentials (for testing only)</span>
                {showHint
                  ? <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                }
              </button>
              {showHint && (
                <div className="px-3 pb-3 pt-1 text-[11px] text-blue-800 space-y-1 border-t border-blue-200 bg-blue-50">
                  <p><span className="font-semibold">Username:</span> staff01</p>
                  <p><span className="font-semibold">Password:</span> staff123</p>
                </div>
              )}
            </div>

            {/* Switch to admin */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5 cursor-pointer"
              onClick={onSwitchToAdmin}
            >
              Admin Login
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
