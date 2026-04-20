"use client";

import { useState } from "react";
import Sidebar, { type Page } from "@/components/sidebar";
import TopNav from "@/components/topnav";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { type Transaction } from "@/lib/data";
import { loadLoyaltySettings, loadBusinessProfile, type BusinessProfile } from "@/lib/settings-store";
import DashboardPage from "@/components/pages/dashboard";
import TransactionsPage from "@/components/pages/transactions";
import ClaimVerificationPage from "@/components/pages/claim-verification";
import ReportsPage from "@/components/pages/reports";
import SettingsPage from "@/components/pages/settings";
import LoyaltyPage from "@/components/pages/loyalty";
import ProfilePage from "@/components/pages/profile";
import ChangePasswordPage from "@/components/pages/change-password";
import DataImportPage from "@/components/pages/data-import";
import StaffManagementPage from "@/components/pages/staff-management";
import AuditLogsPage from "@/components/pages/audit-logs";
import type { UserProfile } from "@/lib/auth";
import { useTransactions } from "@/hooks/use-transactions";
import { toast } from "@/hooks/use-toast";

interface AppShellProps {
  onSignOut: () => void;
  adminProfile: UserProfile;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

export default function AppShell({ onSignOut, adminProfile, onProfileUpdate }: AppShellProps) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState<boolean>(() => loadLoyaltySettings().enabled);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => loadBusinessProfile());
  const {
    transactions: txns,
    loading: transactionsLoading,
    error: transactionsError,
    createTransaction,
    updateTransaction,
    resolveScannedValue,
  } = useTransactions();

  const handleTransactionDetail = (ticketId: string) => {
    const txn = txns.find((t) => t.ticketId === ticketId) ?? null;
    setDetailTxn(txn);
    setDetailOpen(true);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage transactions={txns} loyaltyEnabled={loyaltyEnabled} role={adminProfile.role} onNavigate={handleNavigate} />;
      case "transactions":
        return (
          <TransactionsPage
            transactions={txns}
            loading={transactionsLoading}
            error={transactionsError}
            loyaltyEnabled={loyaltyEnabled}
            onCreateTransaction={createTransaction}
            onUpdateTransaction={updateTransaction}
          />
        );
      case "claim-verification":
        return (
          <ClaimVerificationPage
            transactions={txns}
            loading={transactionsLoading}
            error={transactionsError}
            onUpdateTransaction={updateTransaction}
            onResolveScannedValue={resolveScannedValue}
          />
        );
      case "reports": return <ReportsPage transactions={txns} />;
      case "settings-pricing":
      case "settings-service-types":
      case "settings-backup":
        return <SettingsPage page={activePage} />;
      case "settings-business-profile":
        return <SettingsPage page={activePage} onBusinessProfileChange={setBusinessProfile} />;
      case "settings-loyalty":
        return <SettingsPage page={activePage} loyaltyEnabled={loyaltyEnabled} onLoyaltyEnabledChange={setLoyaltyEnabled} />;
      case "settings-data-import":
        return <DataImportPage onViewTransactions={() => handleNavigate("transactions")} />;
      case "staff-management": return <StaffManagementPage />;
      case "audit-logs": return <AuditLogsPage />;
      case "loyalty": return <LoyaltyPage loyaltyEnabled={loyaltyEnabled} />;
      case "profile": return <ProfilePage userProfile={adminProfile} shopName={businessProfile.shopName} contactNumber={businessProfile.contactNumber} />;
      case "change-password": return <ChangePasswordPage adminProfile={adminProfile} onProfileUpdate={onProfileUpdate} />;
      default: return <DashboardPage transactions={txns} loyaltyEnabled={loyaltyEnabled} />;
    }
  };

  // Pages staff are NOT allowed to access at all
  const STAFF_BLOCKED: Page[] = [
    "reports",
    "settings-backup",
    "settings-data-import",
    "staff-management",
    "audit-logs",
  ];

  const handleNavigate = (page: Page) => {
    if (adminProfile.role === "staff" && STAFF_BLOCKED.includes(page)) {
      // Redirect to dashboard and notify
      setActivePage("dashboard");
      setMobileMenuOpen(false);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      return;
    }
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless menu is open */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 lg:static lg:z-auto lg:flex
          transition-transform duration-300
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar activePage={activePage} onNavigate={handleNavigate} loyaltyEnabled={loyaltyEnabled} role={adminProfile.role} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          activePage={activePage}
          onNavigate={handleNavigate}
          onSignOut={onSignOut}
          adminProfile={adminProfile}
          transactions={txns}
          onMenuToggle={() => setMobileMenuOpen((v) => !v)}
          onTransactionDetail={handleTransactionDetail}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>

    <TransactionDetailModal
      open={detailOpen}
      onOpenChange={setDetailOpen}
      transaction={detailTxn}
    />
    </>
  );
}
