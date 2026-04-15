// ── Role definitions ─────────────────────────────────────────────────────────

export type UserRole = "admin" | "staff";

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: UserRole;
}

// ── Mock credential store ─────────────────────────────────────────────────────
// TODO: Replace mock auth with Supabase auth
// In a real app these would live in a database with hashed passwords.

interface AdminAccount {
  email: string;
  password: string;
  profile: UserProfile;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: "admin@laundrytrack.ph",
    password: "admin123",
    profile: {
      name: "Admin User",
      email: "admin@laundrytrack.ph",
      username: "admin",
      phone: "+63 912 345 6789",
      role: "admin",
    },
  },
  {
    email: "owner@laundrytrack.ph",
    password: "owner123",
    profile: {
      name: "Owner",
      email: "owner@laundrytrack.ph",
      username: "owner",
      phone: "+63 912 345 6780",
      role: "admin",
    },
  },
];

export interface StaffAccount {
  username: string;
  password: string;
  profile: Omit<UserProfile, "role">;
}

// Staff accounts are "created by admin".  Seed two demo accounts.
export const staffAccounts: StaffAccount[] = [
  {
    username: "staff01",
    password: "staff123",
    profile: {
      name: "Staff One",
      email: "staff01@laundrytrack.ph",
      username: "staff01",
      phone: "+63 912 000 0001",
    },
  },
  {
    username: "staff02",
    password: "staff456",
    profile: {
      name: "Staff Two",
      email: "staff02@laundrytrack.ph",
      username: "staff02",
      phone: "+63 912 000 0002",
    },
  },
];

// ── Auth helpers ──────────────────────────────────────────────────────────────

export function authenticateAdmin(email: string, password: string): UserProfile | null {
  const account = ADMIN_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );
  return account ? account.profile : null;
}

export function authenticateStaff(username: string, password: string): UserProfile | null {
  const account = staffAccounts.find(
    (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
  );
  if (!account) return null;
  return { ...account.profile, role: "staff" };
}
