"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import LoginPage from "@/components/pages/login";
import StaffLoginPage from "@/components/pages/staff-login";
import ForgotPasswordPage from "@/components/pages/forgot-password";
import RegisterPage from "@/components/pages/register";
import type { UserProfile } from "@/lib/auth";
import { authenticateAdmin } from "@/lib/auth";

// ── Legacy type alias kept for ChangePasswordPage compat ──────────────────────
export interface AdminProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
}

type AuthView = "role-select" | "admin-login" | "staff-login" | "forgot-password" | "register" | "app";

export default function Home() {
  const [view, setView] = useState<AuthView>("role-select");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ── Admin login handler (uses mock auth, matches existing UX) ──────────────
  const handleAdminLogin = () => {
    // The existing LoginPage does its own minimal validation.
    // We set a default admin profile here since LoginPage doesn't return credentials.
    const profile = authenticateAdmin("admin", "admin123")!;
    setUserProfile(profile);
    setView("app");
  };

  // ── Staff login handler ────────────────────────────────────────────────────
  const handleStaffLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setView("app");
  };

  const handleSignOut = () => {
    setUserProfile(null);
    setView("role-select");
  };

  // ── Role selection screen ─────────────────────────────────────────────────
  if (view === "role-select") {
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
          <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10 text-center">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
                {/* Inline SVG washing machine to avoid extra import */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary-foreground fill-none stroke-current stroke-[1.5]">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <circle cx="12" cy="13" r="4" />
                  <line x1="6" y1="7" x2="6" y2="7" strokeLinecap="round" strokeWidth="2" />
                  <line x1="9" y1="7" x2="9" y2="7" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
            </div>

            <p className="text-sm font-medium text-foreground mb-6">Sign in as</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setView("admin-login")}
                className="w-full rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors px-5 py-3 text-center group cursor-pointer"
              >
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Admin</p>
              </button>

              <button
                onClick={() => setView("staff-login")}
                className="w-full rounded-xl border-2 border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-colors px-5 py-3 text-center group cursor-pointer"
              >
                <p className="text-sm font-semibold text-foreground">Staff</p>
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-white/50 mt-5">
            &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // ── Auth sub-views ────────────────────────────────────────────────────────
  if (view === "forgot-password") {
    return <ForgotPasswordPage onBack={() => setView("admin-login")} />;
  }

  if (view === "register") {
    return <RegisterPage onBack={() => setView("admin-login")} />;
  }

  if (view === "admin-login") {
    return (
      <LoginPage
        onLogin={handleAdminLogin}
        onForgotPassword={() => setView("forgot-password")}
        onCreateAccount={() => setView("register")}
        onBack={() => setView("role-select")}
      />
    );
  }

  if (view === "staff-login") {
    return (
      <StaffLoginPage
        onLogin={handleStaffLogin}
        onSwitchToAdmin={() => setView("admin-login")}
      />
    );
  }

  // ── App ───────────────────────────────────────────────────────────────────
  if (!userProfile) return null;

  return (
    <AppShell
      onSignOut={handleSignOut}
      adminProfile={userProfile}
      onProfileUpdate={(updates) =>
        setUserProfile((prev) => prev ? { ...prev, ...updates } : prev)
      }
    />
  );
}
