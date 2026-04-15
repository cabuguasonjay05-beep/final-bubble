"use client";

import { useState } from "react";
import {
  Eye, EyeOff, Pencil, Search, UserCheck, UserX, Users,
  KeyRound, CheckCircle2, Plus, UserMinus, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { staffAccounts, type StaffAccount } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────────────────────────

interface StaffRecord extends StaffAccount {
  active: boolean;
  dateCreated: string; // ISO date string
}

// ── Initial seed data ─────────────────────────────────────────────────────────

const initialRecords: StaffRecord[] = staffAccounts.map((a, i) => ({
  ...a,
  active: true,
  dateCreated: i === 0 ? "2026-01-10" : "2026-02-14",
}));

// ── Reusable password field ───────────────────────────────────────────────────

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium mb-1.5 block">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-sm pr-9"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, placeholder, type = "text", required,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium mb-1.5 block">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<StaffRecord[]>(initialRecords);
  const [search, setSearch] = useState("");

  // ── Add Staff modal ────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editActive, setEditActive] = useState(true);

  // ── Reset Password modal ──────────────────────────────────────────────────
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  // ── Deactivate confirm ────────────────────────────────────────────────────
  const [deactivateTarget, setDeactivateTarget] = useState<StaffRecord | null>(null);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !search ||
      r.profile.name.toLowerCase().includes(q) ||
      r.profile.username.toLowerCase().includes(q) ||
      r.profile.email.toLowerCase().includes(q) ||
      r.profile.phone.toLowerCase().includes(q)
    );
  });

  // ── Add Staff handlers ────────────────────────────────────────────────────

  const resetAddForm = () => {
    setAddName(""); setAddUsername(""); setAddPhone("");
    setAddEmail(""); setAddPassword(""); setAddConfirmPassword("");
    setAddErrors({});
  };

  const handleAddStaff = () => {
    const errs: Record<string, string> = {};
    if (!addName.trim()) errs.name = "Full name is required.";
    if (!addUsername.trim()) errs.username = "Username is required.";
    else if (records.some((r) => r.profile.username.toLowerCase() === addUsername.trim().toLowerCase())) {
      errs.username = "Username already exists.";
    }
    if (!addPassword) errs.password = "Password is required.";
    else if (addPassword.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!addConfirmPassword) errs.confirmPassword = "Please confirm the password.";
    else if (addPassword !== addConfirmPassword) errs.confirmPassword = "Passwords do not match.";

    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }

    const newRecord: StaffRecord = {
      username: addUsername.trim(),
      password: addPassword,
      active: true,
      dateCreated: new Date().toISOString().slice(0, 10),
      profile: {
        name: addName.trim(),
        email: addEmail.trim() || `${addUsername.trim().toLowerCase()}@laundrytrack.ph`,
        username: addUsername.trim(),
        phone: addPhone.trim(),
      },
    };
    setRecords((prev) => [...prev, newRecord]);
    setAddOpen(false);
    resetAddForm();
    toast({ title: "Staff account created", description: `${newRecord.profile.name} has been added.` });
  };

  // ── Edit handlers ─────────────────────────────────────────────────────────

  const openEdit = (record: StaffRecord) => {
    setEditTarget(record);
    setEditName(record.profile.name);
    setEditUsername(record.profile.username);
    setEditPhone(record.profile.phone);
    setEditEmail(record.profile.email);
    setEditActive(record.active);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.username === editTarget.username
          ? {
              ...r,
              active: editActive,
              profile: {
                ...r.profile,
                name: editName.trim() || r.profile.name,
                username: editUsername.trim() || r.profile.username,
                phone: editPhone.trim(),
                email: editEmail.trim() || r.profile.email,
              },
            }
          : r
      )
    );
    setEditOpen(false);
    toast({ title: "Staff profile updated", description: `${editName || editTarget.profile.name}'s profile has been saved.` });
  };

  // ── Reset Password handlers ───────────────────────────────────────────────

  const openReset = (record: StaffRecord) => {
    setResetTarget(record);
    setNewPassword(""); setConfirmPassword(""); setPwError("");
    setResetOpen(true);
  };

  const handleResetPassword = () => {
    if (!resetTarget) return;
    if (!newPassword) { setPwError("Please enter a new password."); return; }
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwError(""); setResetOpen(false);
    toast({ title: "Password reset successfully", description: `${resetTarget.profile.name}'s password has been updated.` });
  };

  // ── Deactivate/Reactivate ─────────────────────────────────────────────────

  const handleDeactivate = () => {
    if (!deactivateTarget) return;
    const isActive = deactivateTarget.active;
    setRecords((prev) =>
      prev.map((r) => r.username === deactivateTarget.username ? { ...r, active: !r.active } : r)
    );
    setDeactivateTarget(null);
    toast({
      title: isActive ? "Staff account deactivated" : "Staff account reactivated",
      description: `${deactivateTarget.profile.name} has been ${isActive ? "deactivated" : "reactivated"}.`,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl space-y-5">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Staff Members</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {records.length} staff account{records.length !== 1 ? "s" : ""} &middot; {records.filter((r) => r.active).length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm w-52"
            />
          </div>
          <Button
            size="sm"
            className="h-9 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            onClick={() => { resetAddForm(); setAddOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Staff table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Username</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Phone Number</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Date Created</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No staff members found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.username} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0 select-none">
                          {getInitials(record.profile.name)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{record.profile.name}</p>
                          <p className="text-[11px] text-muted-foreground">{record.profile.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Username */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono text-foreground">@{record.profile.username}</span>
                    </td>
                    {/* Phone */}
                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground">{record.profile.phone || "—"}</span>
                    </td>
                    {/* Date Created */}
                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(record.dateCreated)}</span>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3">
                      {record.active ? (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 font-medium">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground font-medium">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2.5 flex items-center gap-1 cursor-pointer"
                          onClick={() => openEdit(record)}
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2.5 flex items-center gap-1 cursor-pointer"
                          onClick={() => openReset(record)}
                        >
                          <KeyRound className="w-3 h-3" />
                          Reset PW
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-7 text-[11px] px-2.5 flex items-center gap-1 cursor-pointer ${record.active ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}`}
                          onClick={() => setDeactivateTarget(record)}
                        >
                          {record.active ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                          {record.active ? "Deactivate" : "Reactivate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users className="w-8 h-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No staff members found.</p>
            </div>
          ) : (
            filtered.map((record) => (
              <div key={record.username} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                    {getInitials(record.profile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-foreground">{record.profile.name}</p>
                      {record.active ? (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">@{record.profile.username} &middot; {record.profile.phone || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">Created: {formatDate(record.dateCreated)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="h-8 text-xs flex items-center gap-1 cursor-pointer" onClick={() => openEdit(record)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs flex items-center gap-1 cursor-pointer" onClick={() => openReset(record)}>
                    <KeyRound className="w-3 h-3" /> Reset PW
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className={`h-8 text-xs flex items-center gap-1 cursor-pointer ${record.active ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}`}
                    onClick={() => setDeactivateTarget(record)}
                  >
                    {record.active ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                    {record.active ? "Deactivate" : "Reactivate"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add Staff Modal ────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetAddForm(); }}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add Staff Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <Field id="add-name" label="Full Name" value={addName} onChange={setAddName} placeholder="e.g. Maria Santos" required />
            {addErrors.name && <p className="text-xs text-destructive -mt-2">{addErrors.name}</p>}

            <Field id="add-username" label="Username" value={addUsername} onChange={setAddUsername} placeholder="e.g. maria_santos" required />
            {addErrors.username && <p className="text-xs text-destructive -mt-2">{addErrors.username}</p>}

            <Field id="add-phone" label="Phone Number" value={addPhone} onChange={setAddPhone} placeholder="+63 9XX XXX XXXX" />

            <Field id="add-email" label="Email Address" value={addEmail} onChange={setAddEmail} placeholder="staff@laundrytrack.ph" type="email" />

            <PasswordField id="add-password" label="Password" value={addPassword} onChange={(v) => { setAddPassword(v); setAddErrors((e) => ({ ...e, password: "" })); }} placeholder="Min. 6 characters" required />
            {addErrors.password && <p className="text-xs text-destructive -mt-2">{addErrors.password}</p>}

            <PasswordField id="add-confirm-password" label="Confirm Password" value={addConfirmPassword} onChange={(v) => { setAddConfirmPassword(v); setAddErrors((e) => ({ ...e, confirmPassword: "" })); }} placeholder="Re-enter password" required />
            {addErrors.confirmPassword && <p className="text-xs text-destructive -mt-2">{addErrors.confirmPassword}</p>}

            {/* Role (fixed) */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-muted/30">
              <div>
                <p className="text-xs font-medium text-foreground">Role</p>
                <p className="text-[11px] text-muted-foreground">Cannot be changed to Admin</p>
              </div>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 font-medium">Staff</Badge>
            </div>

            <Button className="w-full cursor-pointer" onClick={handleAddStaff}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Staff Modal ───────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Staff Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <Field id="edit-name" label="Full Name" value={editName} onChange={setEditName} placeholder="Full name" />
            <Field id="edit-username" label="Username" value={editUsername} onChange={setEditUsername} placeholder="Username" />
            <Field id="edit-email" label="Email Address" value={editEmail} onChange={setEditEmail} placeholder="Email address" type="email" />
            <Field id="edit-phone" label="Phone Number" value={editPhone} onChange={setEditPhone} placeholder="Phone number" />

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-2">
                {editActive ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-muted-foreground" />}
                <div>
                  <p className="text-xs font-medium text-foreground">Account Status</p>
                  <p className="text-[11px] text-muted-foreground">{editActive ? "Active — can log in" : "Inactive — login blocked"}</p>
                </div>
              </div>
              <Switch checked={editActive} onCheckedChange={setEditActive} aria-label="Toggle staff active status" />
            </div>

            <Button className="w-full cursor-pointer" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Modal ───────────────────────────────────────────── */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Reset Password — {resetTarget?.profile.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <PasswordField id="reset-new-pw" label="New Password" value={newPassword} onChange={(v) => { setNewPassword(v); setPwError(""); }} placeholder="Min. 6 characters" required />
            <PasswordField id="reset-confirm-pw" label="Confirm Password" value={confirmPassword} onChange={(v) => { setConfirmPassword(v); setPwError(""); }} placeholder="Re-enter new password" required />
            {pwError && <p className="text-xs text-destructive">{pwError}</p>}
            <Button className="w-full cursor-pointer" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate/Reactivate Confirm ──────────────────────────────────── */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => { if (!o) setDeactivateTarget(null); }}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {deactivateTarget?.active ? "Deactivate" : "Reactivate"} Staff Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {deactivateTarget?.active
                ? `${deactivateTarget?.profile.name} will no longer be able to log in. You can reactivate their account at any time.`
                : `${deactivateTarget?.profile.name} will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`cursor-pointer ${deactivateTarget?.active ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
              onClick={handleDeactivate}
            >
              {deactivateTarget?.active ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
