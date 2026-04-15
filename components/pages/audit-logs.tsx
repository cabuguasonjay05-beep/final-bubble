"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Download,
  ScrollText,
  ShieldCheck,
  Receipt,
  QrCode,
  Star,
  Settings2,
  UserCog,
  LogIn,
  FileBarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ────────────────────────────────────────────────────────────────────

type ActionType =
  | "all"
  | "transaction_created"
  | "transaction_updated"
  | "status_changed"
  | "claim_verified"
  | "loyalty_stamp"
  | "reward_redeemed"
  | "settings_changed"
  | "staff_created"
  | "staff_deactivated"
  | "login"
  | "logout"
  | "report_exported";

interface AuditEntry {
  id: string;
  timestamp: string;    // ISO
  staffName: string;
  staffRole: "Admin" | "Staff";
  action: ActionType;
  summary: string;
  details: string;
  ipAddress?: string;
}

// ── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_LOGS: AuditEntry[] = [
  {
    id: "AL-001",
    timestamp: "2026-04-15T14:32:00",
    staffName: "Maria Santos",
    staffRole: "Staff",
    action: "transaction_created",
    summary: "Created transaction TKT-0012",
    details: "Customer: Jose Reyes | Service: Full Wash | Fee: ₱250 | Drop-off: 2026-04-15",
    ipAddress: "192.168.1.10",
  },
  {
    id: "AL-002",
    timestamp: "2026-04-15T13:45:00",
    staffName: "Juan dela Cruz",
    staffRole: "Staff",
    action: "claim_verified",
    summary: "Verified claim for TKT-0008",
    details: "Customer: Ana Reyes | QR scan successful | Item released at counter",
    ipAddress: "192.168.1.11",
  },
  {
    id: "AL-003",
    timestamp: "2026-04-15T12:10:00",
    staffName: "Admin",
    staffRole: "Admin",
    action: "settings_changed",
    summary: "Updated pricing settings",
    details: "Changed full wash rate from ₱220 to ₱250 | Add-on: Fabric conditioner set to ₱30",
    ipAddress: "192.168.1.1",
  },
  {
    id: "AL-004",
    timestamp: "2026-04-15T11:30:00",
    staffName: "Maria Santos",
    staffRole: "Staff",
    action: "loyalty_stamp",
    summary: "Added loyalty stamp for member Jose Reyes",
    details: "Member ID: LM-003 | Stamps before: 4 | Stamps after: 5 | Transaction: TKT-0011",
    ipAddress: "192.168.1.10",
  },
  {
    id: "AL-005",
    timestamp: "2026-04-15T10:00:00",
    staffName: "Admin",
    staffRole: "Admin",
    action: "staff_created",
    summary: "Created staff account: maria_santos",
    details: "Full Name: Maria Santos | Username: maria_santos | Role: Staff | Status: Active",
    ipAddress: "192.168.1.1",
  },
  {
    id: "AL-006",
    timestamp: "2026-04-14T17:55:00",
    staffName: "Juan dela Cruz",
    staffRole: "Staff",
    action: "status_changed",
    summary: "Updated status of TKT-0005 to Ready",
    details: "Previous status: Drying | New status: Ready | Customer notified",
    ipAddress: "192.168.1.11",
  },
  {
    id: "AL-007",
    timestamp: "2026-04-14T16:20:00",
    staffName: "Admin",
    staffRole: "Admin",
    action: "report_exported",
    summary: "Exported monthly report to PDF",
    details: "Report type: Monthly Summary | Period: March 2026 | Format: PDF",
    ipAddress: "192.168.1.1",
  },
  {
    id: "AL-008",
    timestamp: "2026-04-14T09:01:00",
    staffName: "Maria Santos",
    staffRole: "Staff",
    action: "login",
    summary: "Logged in",
    details: "Session started | Browser: Chrome | Device: Desktop",
    ipAddress: "192.168.1.10",
  },
  {
    id: "AL-009",
    timestamp: "2026-04-14T08:58:00",
    staffName: "Juan dela Cruz",
    staffRole: "Staff",
    action: "login",
    summary: "Logged in",
    details: "Session started | Browser: Firefox | Device: Desktop",
    ipAddress: "192.168.1.11",
  },
  {
    id: "AL-010",
    timestamp: "2026-04-13T15:40:00",
    staffName: "Maria Santos",
    staffRole: "Staff",
    action: "reward_redeemed",
    summary: "Redeemed reward for loyalty member Ana Reyes",
    details: "Member ID: LM-007 | Reward: Free Wash | Stamps used: 10 | Remaining: 0",
    ipAddress: "192.168.1.10",
  },
  {
    id: "AL-011",
    timestamp: "2026-04-13T14:12:00",
    staffName: "Admin",
    staffRole: "Admin",
    action: "staff_deactivated",
    summary: "Deactivated staff account: old_staff",
    details: "Username: old_staff | Reason: Resigned | Deactivated by: Admin",
    ipAddress: "192.168.1.1",
  },
  {
    id: "AL-012",
    timestamp: "2026-04-13T11:05:00",
    staffName: "Juan dela Cruz",
    staffRole: "Staff",
    action: "transaction_updated",
    summary: "Updated TKT-0003 service type",
    details: "Field changed: washType | Old: Quick Wash | New: Full Wash | Fee adjusted: ₱180 → ₱250",
    ipAddress: "192.168.1.11",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<ActionType, string> = {
  all: "All Actions",
  transaction_created: "Transaction Created",
  transaction_updated: "Transaction Updated",
  status_changed: "Status Changed",
  claim_verified: "Claim Verified",
  loyalty_stamp: "Loyalty Stamp Added",
  reward_redeemed: "Reward Redeemed",
  settings_changed: "Settings Changed",
  staff_created: "Staff Account Created",
  staff_deactivated: "Staff Account Deactivated",
  login: "Login",
  logout: "Logout",
  report_exported: "Report Exported",
};

const ACTION_ICONS: Record<ActionType, React.ElementType> = {
  all: ScrollText,
  transaction_created: Receipt,
  transaction_updated: Receipt,
  status_changed: Receipt,
  claim_verified: QrCode,
  loyalty_stamp: Star,
  reward_redeemed: Star,
  settings_changed: Settings2,
  staff_created: UserCog,
  staff_deactivated: UserCog,
  login: LogIn,
  logout: LogIn,
  report_exported: FileBarChart2,
};

const ACTION_COLORS: Record<ActionType, string> = {
  all: "bg-muted text-muted-foreground",
  transaction_created: "bg-blue-50 text-blue-700",
  transaction_updated: "bg-blue-50 text-blue-600",
  status_changed: "bg-indigo-50 text-indigo-700",
  claim_verified: "bg-green-50 text-green-700",
  loyalty_stamp: "bg-yellow-50 text-yellow-700",
  reward_redeemed: "bg-orange-50 text-orange-700",
  settings_changed: "bg-slate-100 text-slate-700",
  staff_created: "bg-teal-50 text-teal-700",
  staff_deactivated: "bg-red-50 text-red-600",
  login: "bg-muted text-muted-foreground",
  logout: "bg-muted text-muted-foreground",
  report_exported: "bg-purple-50 text-purple-700",
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ── Row component ─────────────────────────────────────────────────────────────

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICONS[entry.action];
  const colorClass = ACTION_COLORS[entry.action];

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full text-left px-4 md:px-5 py-3 hover:bg-muted/30 transition-colors flex items-start gap-3"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Icon */}
        <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold text-foreground">{entry.staffName}</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-medium ${entry.staffRole === "Admin" ? "bg-primary/10 text-primary" : "bg-teal-100 text-teal-700"}`}
            >
              {entry.staffRole}
            </Badge>
            <span className="text-xs text-muted-foreground">{entry.summary}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
            <span className="text-[11px] text-muted-foreground/60">{timeAgo(entry.timestamp)}</span>
            {entry.ipAddress && (
              <span className="text-[11px] text-muted-foreground/60 hidden md:inline">IP: {entry.ipAddress}</span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 mt-1 text-muted-foreground/50">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 md:px-5 pb-3 pl-[52px] md:pl-[60px]">
          <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2 leading-relaxed border border-border">
            {entry.details}
          </p>
          {entry.ipAddress && (
            <p className="text-[11px] text-muted-foreground mt-1.5 md:hidden">IP: {entry.ipAddress}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ACTION_TYPES: ActionType[] = [
  "all",
  "transaction_created",
  "transaction_updated",
  "status_changed",
  "claim_verified",
  "loyalty_stamp",
  "reward_redeemed",
  "settings_changed",
  "staff_created",
  "staff_deactivated",
  "login",
  "logout",
  "report_exported",
];

const STAFF_FILTER_OPTIONS = ["All Staff", "Admin", "Maria Santos", "Juan dela Cruz"];

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionType>("all");
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return SAMPLE_LOGS.filter((entry) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        if (
          !entry.staffName.toLowerCase().includes(q) &&
          !entry.summary.toLowerCase().includes(q) &&
          !entry.details.toLowerCase().includes(q) &&
          !entry.id.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      // Action type
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      // Staff filter
      if (staffFilter !== "All Staff") {
        if (staffFilter === "Admin" && entry.staffRole !== "Admin") return false;
        else if (staffFilter !== "Admin" && entry.staffName !== staffFilter) return false;
      }
      // Date from
      if (dateFrom && entry.timestamp < dateFrom) return false;
      // Date to
      if (dateTo && entry.timestamp > dateTo + "T23:59:59") return false;
      return true;
    });
  }, [search, actionFilter, staffFilter, dateFrom, dateTo]);

  return (
    <div className="w-full max-w-5xl space-y-5">
      {/* Filter bar */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by staff name, ticket ID, action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* Action type */}
            <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionType)}>
              <SelectTrigger className="h-9 text-sm w-auto min-w-[170px]">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-sm">
                    {ACTION_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Staff filter */}
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="h-9 text-sm w-auto min-w-[140px]">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_FILTER_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="To date"
            />

            {/* Export */}
            <Button variant="outline" size="sm" className="h-9 text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card className="border border-border shadow-none overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border bg-muted/30">
          <p className="text-xs font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />
            Log Entries
          </p>
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No log entries match your filters.</p>
            <button
              className="text-xs text-primary mt-2 hover:underline cursor-pointer"
              onClick={() => { setSearch(""); setActionFilter("all"); setStaffFilter("All Staff"); setDateFrom(""); setDateTo(""); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </Card>

      <p className="text-[11px] text-muted-foreground text-center">
        Audit logs are read-only and cannot be edited or deleted.
      </p>
    </div>
  );
}
