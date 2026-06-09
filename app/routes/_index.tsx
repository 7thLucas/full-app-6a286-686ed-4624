import { redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { LoanService } from "~/modules/loans/src/services/loan.service";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { LoanCard } from "~/components/loans/LoanCard";
import { formatCurrency, formatDate, daysUntilDue } from "~/components/loans/loan-utils";
import { useConfigurables } from "~/modules/configurables";
import { Plus, TrendingDown, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Link } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const [summary, upcomingLoans, allLoans] = await Promise.all([
    LoanService.getDashboardSummary(user.id),
    LoanService.getUpcomingPayments(user.id, 14),
    LoanService.getLoansForUser(user.id),
  ]);

  return {
    user,
    summary,
    upcomingLoans: upcomingLoans.map((l) => l.toObject()),
    recentLoans: allLoans.slice(0, 5).map((l) => l.toObject()),
    totalLoans: allLoans.length,
  };
}

export default function DashboardPage() {
  const { user, summary, upcomingLoans, recentLoans, totalLoans } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader />

      <main className="max-w-[480px] mx-auto pb-24">
        {/* Hero Summary Card */}
        <div className="bg-[#0F2044] px-5 pb-6 pt-1">
          <div className="bg-[#1A3560] rounded-2xl p-5 shadow-lg">
            <p className="text-[#94A3B8] text-xs uppercase tracking-widest font-medium mb-3">
              {config?.dashboardWelcomeMessage ?? "Your loan overview"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown size={14} className="text-[#EF4444]" />
                  <span className="text-[#94A3B8] text-xs font-medium">You Owe</span>
                </div>
                <p className="text-white text-2xl font-bold">{formatCurrency(summary.totalOwed, symbol)}</p>
                <div className="h-0.5 bg-[#EF4444] rounded-full mt-2 w-12 opacity-60" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={14} className="text-[#22C55E]" />
                  <span className="text-[#94A3B8] text-xs font-medium">You're Owed</span>
                </div>
                <p className="text-white text-2xl font-bold">{formatCurrency(summary.totalLent, symbol)}</p>
                <div className="h-0.5 bg-[#22C55E] rounded-full mt-2 w-12 opacity-60" />
              </div>
            </div>

            {summary.overdueCount > 0 && (
              <div className="mt-4 flex items-center gap-2 bg-[#EF4444]/15 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0" />
                <p className="text-[#EF4444] text-xs font-medium">
                  {summary.overdueCount} overdue loan{summary.overdueCount > 1 ? "s" : ""} — action needed
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pt-5 space-y-6">
          {/* Quick Add Button */}
          <Link
            to="/loans/new"
            className="flex items-center justify-center gap-2 w-full bg-[#F5A623] text-[#0F2044] font-bold text-[15px] py-3.5 rounded-2xl shadow-md hover:bg-[#e8961a] active:scale-[0.97] transition-all duration-200"
          >
            <Plus size={20} strokeWidth={2.5} />
            {config?.addLoanCTALabel ?? "Add Loan"}
          </Link>

          {/* Upcoming Payments */}
          {upcomingLoans.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#0F172A] font-semibold text-base flex items-center gap-2">
                  <Calendar size={17} className="text-[#F5A623]" />
                  Upcoming Payments
                </h2>
                <Link to="/loans" className="text-[#F5A623] text-xs font-semibold hover:underline">
                  See all
                </Link>
              </div>
              <div className="space-y-2">
                {upcomingLoans.map((loan: any) => {
                  const remaining = loan.principalAmount - (loan.totalPaid || 0);
                  const daysLeft = daysUntilDue(loan.dueDate);
                  return (
                    <Link
                      key={loan._id}
                      to={`/loans/${loan._id}`}
                      className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${loan.status === "overdue" ? "bg-[#EF4444]" : "bg-[#F5A623]"}`} />
                        <div>
                          <p className="text-[#0F172A] text-sm font-semibold">{loan.counterpartyName}</p>
                          <p className={`text-xs ${daysLeft < 0 ? "text-[#EF4444]" : daysLeft <= 3 ? "text-[#F5A623]" : "text-[#64748B]"}`}>
                            {daysLeft < 0
                              ? `${Math.abs(daysLeft)}d overdue`
                              : daysLeft === 0
                              ? "Due today"
                              : `${daysLeft}d left`}
                          </p>
                        </div>
                      </div>
                      <p className="text-[#0F2044] font-bold text-sm">{formatCurrency(remaining, symbol)}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* My Loans */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#0F172A] font-semibold text-base">
                My Loans
                {totalLoans > 0 && (
                  <span className="ml-2 text-xs text-[#64748B] font-normal">({totalLoans})</span>
                )}
              </h2>
              {totalLoans > 5 && (
                <Link to="/loans" className="text-[#F5A623] text-xs font-semibold hover:underline">
                  View all
                </Link>
              )}
            </div>

            {recentLoans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center">
                <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-[#94A3B8]" />
                </div>
                <p className="text-[#0F172A] font-semibold text-sm">No loans yet</p>
                <p className="text-[#64748B] text-xs mt-1">Add your first loan to get started</p>
                <Link
                  to="/loans/new"
                  className="inline-block mt-4 text-[#F5A623] font-semibold text-sm hover:underline"
                >
                  Add a loan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan: any) => (
                  <LoanCard key={loan._id} loan={loan} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
