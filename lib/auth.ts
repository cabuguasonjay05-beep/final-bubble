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
// In a real app these would live in a database with hashed passwords.

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

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

export function authenticateAdmin(username: string, password: string): UserProfile | null {
  if (
    username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    return {
      name: "Admin User",
      email: "admin@laundrytrack.ph",
      username: "admin",
      phone: "+63 912 345 6789",
      role: "admin",
    };
  }
  return null;
}

export function authenticateStaff(username: string, password: string): UserProfile | null {
  const account = staffAccounts.find(
    (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
  );
  if (!account) return null;
  return { ...account.profile, role: "staff" };
}
