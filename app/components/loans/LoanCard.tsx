import { Link } from "react-router";
import { Calendar, ChevronRight } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  daysUntilDue,
  getStatusColor,
  getInitials,
  calculateRepaymentProgress,
} from "./loan-utils";
import { useConfigurables } from "~/modules/configurables";

interface LoanCardProps {
  loan: {
    _id: string;
    type: "borrowed" | "lent";
    counterpartyName: string;
    principalAmount: number;
    totalPaid: number;
    dueDate: string;
    status: "active" | "overdue" | "paid";
    notes?: string;
    interestRate?: number;
  };
}

export function LoanCard({ loan }: LoanCardProps) {
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";
  const remaining = loan.principalAmount - (loan.totalPaid || 0);
  const progress = calculateRepaymentProgress(loan.principalAmount, loan.totalPaid || 0);
  const daysLeft = daysUntilDue(loan.dueDate);
  const isUrgent = daysLeft <= 7 && loan.status !== "paid";
  const statusColors = getStatusColor(loan.status);

  return (
    <Link
      to={`/loans/${loan._id}`}
      className="block bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex">
        {/* Color strip */}
        <div
          className={`w-1.5 flex-shrink-0 ${loan.type === "lent" ? "bg-[#F5A623]" : "bg-[#1A3560]"}`}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F2044] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{getInitials(loan.counterpartyName)}</span>
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-[15px] leading-tight">{loan.counterpartyName}</p>
                <p className="text-[#64748B] text-xs mt-0.5 capitalize">
                  {loan.type === "borrowed" ? "You owe" : "They owe you"}
                </p>
              </div>
            </div>

            {/* Amount + status */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-[#0F2044] text-[17px]">{formatCurrency(remaining, symbol)}</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 uppercase tracking-wide ${statusColors.bg} ${statusColors.text}`}>
                {loan.status}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#64748B]">{progress}% repaid</span>
              <span className="text-[11px] text-[#64748B]">of {formatCurrency(loan.principalAmount, symbol)}</span>
            </div>
            <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loan.status === "paid" ? "bg-[#22C55E]" : "bg-[#F5A623]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className={isUrgent ? "text-[#F5A623]" : "text-[#94A3B8]"} />
              <span className={`text-[12px] font-medium ${isUrgent ? "text-[#F5A623]" : "text-[#94A3B8]"}`}>
                {loan.status === "paid"
                  ? "Paid in full"
                  : daysLeft < 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft === 0
                  ? "Due today"
                  : `Due ${formatDate(loan.dueDate)}`}
              </span>
            </div>
            <ChevronRight size={14} className="text-[#CBD5E1]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
