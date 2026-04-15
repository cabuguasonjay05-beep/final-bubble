"use client";

import { useState } from "react";
import {
  Eye, EyeOff, Pencil, Search, UserCheck, UserX, Users,
  Camera, KeyRound, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { staffAccounts, type StaffAccount } from "@/lib/auth";

// Local editable staff state (extends StaffAccount with active flag)
interface StaffRecord extends StaffAccount {
  active: boolean;
}

const initialRecords: StaffRecord[] = staffAccounts.map((a) => ({ ...a, active: true }));

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium mb-1.5 block">{label}</Label>
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

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<StaffRecord[]>(initialRecords);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffRecord | null>(null);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editActive, setEditActive] = useState(true);

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const openEdit = (record: StaffRecord) => {
    setEditTarget(record);
    setEditName(record.profile.name);
    setEditUsername(record.profile.username);
    setEditPhone(record.profile.phone);
    setEditEmail(record.profile.email);
    setEditActive(record.active);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setEditOpen(true);
  };

  const handleSaveProfile = () => {
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
    toast({
      title: "Staff profile updated",
      description: `${editName || editTarget.profile.name}'s profile has been saved.`,
    });
  };

  const handleResetPassword = () => {
    if (!editTarget) return;
    if (!newPassword) { setPwError("Please enter a new password."); return; }
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    // In a real app this would hash + persist to the backend
    setPwError("");
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password reset successfully!",
      description: `${editTarget.profile.name}'s password has been updated.`,
    });
  };

  const filtered = records.filter(
    (r) =>
      r.profile.name.toLowerCase().includes(search.toLowerCase()) ||
      r.profile.username.toLowerCase().includes(search.toLowerCase()) ||
      r.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Staff Members</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {records.length} staff account{records.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Staff list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No staff members found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const initials = record.profile.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={record.username} className="border border-border shadow-none">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 select-none">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{record.profile.name}</p>
                        {record.active ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 font-medium">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground font-medium">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">@{record.profile.username} &middot; {record.profile.email}</p>
                      <p className="text-[11px] text-muted-foreground">{record.profile.phone}</p>
                    </div>

                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      onClick={() => openEdit(record)}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Staff Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Staff Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-1">
            {/* Photo placeholder */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-semibold shrink-0 select-none">
                {editName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </div>
              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
            </div>

            {/* Profile fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name" className="text-xs font-medium mb-1.5 block">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-username" className="text-xs font-medium mb-1.5 block">Username</Label>
                <Input
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Username"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-xs font-medium mb-1.5 block">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-xs font-medium mb-1.5 block">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Active/Inactive toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-2">
                {editActive
                  ? <UserCheck className="w-4 h-4 text-green-600" />
                  : <UserX className="w-4 h-4 text-muted-foreground" />
                }
                <div>
                  <p className="text-xs font-medium text-foreground">Account Status</p>
                  <p className="text-[11px] text-muted-foreground">{editActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <Switch
                checked={editActive}
                onCheckedChange={setEditActive}
                aria-label="Toggle staff active status"
              />
            </div>

            {/* Save profile button */}
            <Button
              className="w-full cursor-pointer"
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>

            {/* Divider */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">Reset Password</p>
              </div>

              <div className="space-y-3">
                <PasswordField
                  id="reset-new-pw"
                  label="New Password"
                  value={newPassword}
                  onChange={(v) => { setNewPassword(v); setPwError(""); }}
                  placeholder="Enter new password"
                />
                <PasswordField
                  id="reset-confirm-pw"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(v) => { setConfirmPassword(v); setPwError(""); }}
                  placeholder="Re-enter new password"
                />

                {pwError && (
                  <p className="text-xs text-destructive">{pwError}</p>
                )}

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleResetPassword}
                  disabled={!newPassword || !confirmPassword}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
