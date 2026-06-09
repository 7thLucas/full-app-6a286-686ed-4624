import { redirect, useLoaderData, Form } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { LoanService } from "~/modules/loans/src/services/loan.service";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { useConfigurables } from "~/modules/configurables";
import { formatCurrency, getInitials } from "~/components/loans/loan-utils";
import { LogOut, BookOpen, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const [summary, loans] = await Promise.all([
    LoanService.getDashboardSummary(user.id),
    LoanService.getLoansForUser(user.id),
  ]);

  const paidCount = loans.filter((l) => l.status === "paid").length;
  const activeCount = loans.filter((l) => l.status === "active" || l.status === "overdue").length;

  return { user, summary, paidCount, activeCount, totalLoans: loans.length };
}

export default function ProfilePage() {
  const { user, summary, paidCount, activeCount, totalLoans } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader title="Profile" />

      <main className="max-w-[480px] mx-auto pb-28">
        {/* Profile hero */}
        <div className="bg-[#0F2044] px-5 pb-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F5A623] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0F2044] font-bold text-2xl">{getInitials(user.username || user.email)}</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{user.username}</h2>
              <p className="text-[#94A3B8] text-sm mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<TrendingDown size={16} className="text-[#EF4444]" />}
              label="You Owe"
              value={formatCurrency(summary.totalOwed, symbol)}
              color="red"
            />
            <StatCard
              icon={<TrendingUp size={16} className="text-[#22C55E]" />}
              label="You're Owed"
              value={formatCurrency(summary.totalLent, symbol)}
              color="green"
            />
            <StatCard
              icon={<BookOpen size={16} className="text-[#0F2044]" />}
              label="Active Loans"
              value={String(activeCount)}
              color="navy"
            />
            <StatCard
              icon={<CheckCircle size={16} className="text-[#22C55E]" />}
              label="Paid Off"
              value={String(paidCount)}
              color="green"
            />
          </div>

          {/* Account settings */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9]">
              <h3 className="text-[#0F172A] font-semibold text-sm">Account</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              <MenuRow label="Username" value={user.username} />
              <MenuRow label="Email" value={user.email} />
              <MenuRow label="Total Loans" value={String(totalLoans)} />
            </div>
          </div>

          {/* App info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1F5F9]">
              <h3 className="text-[#0F172A] font-semibold text-sm">About</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              <MenuRow label="App Name" value={config?.appName ?? "Loan Book"} />
              <MenuRow label="Tagline" value={config?.appTagline ?? "Every Loan. Every Payment. One Place."} />
              <MenuRow label="Currency" value={config?.currencySymbol ?? "$"} />
            </div>
          </div>

          {/* Logout */}
          <Form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-[#EF4444] text-[#EF4444] font-bold text-sm rounded-2xl hover:bg-[#FEF2F2] active:scale-[0.97] transition-all duration-200"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </Form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "red" | "green" | "navy";
}) {
  const bgMap = { red: "bg-[#FEF2F2]", green: "bg-[#F0FDF4]", navy: "bg-[#EFF3FA]" };
  return (
    <div className={`${bgMap[color]} rounded-2xl p-4`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-[#64748B] text-xs">{label}</span></div>
      <p className="text-[#0F172A] font-bold text-lg">{value}</p>
    </div>
  );
}

function MenuRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-[#64748B] text-sm">{label}</span>
      <span className="text-[#0F172A] text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
