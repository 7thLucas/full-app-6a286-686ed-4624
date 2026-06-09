import { redirect, useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { LoanService } from "~/modules/loans/src/services/loan.service";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { LoanCard } from "~/components/loans/LoanCard";
import { Plus } from "lucide-react";
import { Link } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "all";
  const type = url.searchParams.get("type") || "all";

  let loans = await LoanService.getLoansForUser(user.id, status === "all" ? undefined : status);

  if (type !== "all") {
    loans = loans.filter((l) => l.type === type);
  }

  return {
    loans: loans.map((l) => l.toObject()),
    activeFilter: status,
    typeFilter: type,
  };
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Both" },
  { value: "borrowed", label: "Borrowed" },
  { value: "lent", label: "Lent" },
];

export default function LoansPage() {
  const { loans, activeFilter, typeFilter } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, { preventScrollReset: true });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader title="My Loans" subtitle={`${loans.length} loan${loans.length !== 1 ? "s" : ""}`} />

      <main className="max-w-[480px] mx-auto pb-24 px-5 pt-4">
        {/* Filters */}
        <div className="space-y-3 mb-5">
          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter("status", f.value)}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                  activeFilter === f.value
                    ? "bg-[#0F2044] text-white shadow-sm"
                    : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#0F2044]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter("type", f.value)}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                  typeFilter === f.value
                    ? "bg-[#F5A623] text-[#0F2044] shadow-sm"
                    : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#F5A623]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loans list */}
        {loans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-10 text-center mt-4">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus size={24} className="text-[#94A3B8]" />
            </div>
            <p className="text-[#0F172A] font-semibold text-sm">No loans found</p>
            <p className="text-[#64748B] text-xs mt-1">
              {activeFilter === "all"
                ? "You haven't added any loans yet."
                : `No ${activeFilter} loans found.`}
            </p>
            {activeFilter === "all" && (
              <Link
                to="/loans/new"
                className="inline-block mt-4 bg-[#F5A623] text-[#0F2044] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#e8961a] transition-colors"
              >
                Add your first loan
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan: any) => (
              <LoanCard key={loan._id} loan={loan} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link
        to="/loans/new"
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#F5A623] text-[#0F2044] rounded-full flex items-center justify-center shadow-lg hover:bg-[#e8961a] active:scale-95 transition-all duration-200 z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>

      <BottomNav />
    </div>
  );
}
