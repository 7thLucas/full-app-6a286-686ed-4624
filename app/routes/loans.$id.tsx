import { redirect, useLoaderData, Form, useActionData, Link } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { LoanService } from "~/modules/loans/src/services/loan.service";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { useConfigurables } from "~/modules/configurables";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getInitials,
  calculateRepaymentProgress,
  getRepaymentLabel,
  daysUntilDue,
} from "~/components/loans/loan-utils";
import { Calendar, DollarSign, Percent, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const loan = await LoanService.getLoanById(params.id!, user.id);
  if (!loan) return redirect("/loans");

  return { loan: loan.toObject() };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add-payment") {
    try {
      await LoanService.addPayment({
        loanId: params.id!,
        userId: user.id,
        amount: Number(formData.get("amount")),
        date: new Date(String(formData.get("date"))),
        notes: String(formData.get("notes") || ""),
      });
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  if (intent === "delete") {
    await LoanService.deleteLoan(params.id!, user.id);
    return redirect("/loans");
  }

  return null;
}

const INPUT_CLASS =
  "w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-colors";
const LABEL_CLASS = "block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5";

export default function LoanDetailPage() {
  const { loan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const remaining = loan.principalAmount - (loan.totalPaid || 0);
  const progress = calculateRepaymentProgress(loan.principalAmount, loan.totalPaid || 0);
  const statusColors = getStatusColor(loan.status);
  const daysLeft = daysUntilDue(loan.dueDate);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader
        title={loan.counterpartyName}
        subtitle={loan.type === "borrowed" ? "You borrowed" : "You lent"}
        backHref="/loans"
        rightElement={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
          >
            <Trash2 size={18} />
          </button>
        }
      />

      <main className="max-w-[480px] mx-auto pb-28 px-5 pt-5 space-y-5">
        {/* Hero card */}
        <div className="bg-[#0F2044] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#1A3560] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{getInitials(loan.counterpartyName)}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg leading-tight">{loan.counterpartyName}</h2>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mt-1 uppercase tracking-wider ${statusColors.bg} ${statusColors.text}`}>
                {loan.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[#94A3B8] text-xs mb-1">Remaining</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(Math.max(0, remaining), symbol)}</p>
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs mb-1">Total Paid</p>
              <p className="text-[#22C55E] font-bold text-2xl">{formatCurrency(loan.totalPaid || 0, symbol)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
              <span>{progress}% repaid</span>
              <span>Principal: {formatCurrency(loan.principalAmount, symbol)}</span>
            </div>
            <div className="h-2 bg-[#1A3560] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loan.status === "paid" ? "bg-[#22C55E]" : "bg-[#F5A623]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E8F0]">
            <h3 className="text-[#0F172A] font-semibold text-sm">Loan Details</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            <DetailRow icon={<Calendar size={15} className="text-[#94A3B8]" />} label="Start Date" value={formatDate(loan.startDate)} />
            <DetailRow
              icon={<Calendar size={15} className={daysLeft < 0 && loan.status !== "paid" ? "text-[#EF4444]" : "text-[#94A3B8]"} />}
              label="Due Date"
              value={formatDate(loan.dueDate)}
              valueClass={daysLeft < 0 && loan.status !== "paid" ? "text-[#EF4444] font-semibold" : undefined}
            />
            {loan.interestRate > 0 && (
              <DetailRow icon={<Percent size={15} className="text-[#94A3B8]" />} label="Interest Rate" value={`${loan.interestRate}% p.a.`} />
            )}
            <DetailRow icon={<DollarSign size={15} className="text-[#94A3B8]" />} label="Repayment" value={getRepaymentLabel(loan.repaymentSchedule)} />
            {loan.notes && (
              <DetailRow icon={<FileText size={15} className="text-[#94A3B8]" />} label="Notes" value={loan.notes} />
            )}
          </div>
        </div>

        {/* Log Payment Button */}
        {loan.status !== "paid" && (
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#0F2044] font-bold text-[15px] py-3.5 rounded-2xl hover:bg-[#e8961a] active:scale-[0.97] transition-all duration-200 shadow-md"
          >
            <Plus size={19} strokeWidth={2.5} />
            Log a Payment
          </button>
        )}

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <h3 className="text-[#0F172A] font-semibold text-sm mb-4">Record Payment</h3>
            {actionData?.error && (
              <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-2.5 mb-3">
                <p className="text-[#DC2626] text-xs">{actionData.error}</p>
              </div>
            )}
            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="add-payment" />
              <div>
                <label className={LABEL_CLASS}>Amount ({symbol})</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  placeholder="0.00"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Payment Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={today}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Notes <span className="normal-case text-[#94A3B8] font-normal">optional</span></label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Cash payment"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 py-3 border border-[#CBD5E1] text-[#64748B] font-semibold text-sm rounded-xl hover:border-[#0F2044] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1A3560] transition-colors"
                >
                  Record
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Payment History */}
        {loan.payments && loan.payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E2E8F0]">
              <h3 className="text-[#0F172A] font-semibold text-sm">Payment History</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {[...loan.payments].reverse().map((payment: any, idx: number) => (
                <div key={idx} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[#0F172A] text-sm font-semibold">{formatCurrency(payment.amount, symbol)}</p>
                    {payment.notes && (
                      <p className="text-[#64748B] text-xs mt-0.5">{payment.notes}</p>
                    )}
                  </div>
                  <p className="text-[#64748B] text-xs">{formatDate(payment.date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[440px] p-6 shadow-2xl animate-in slide-in-from-bottom-4">
            <h3 className="text-[#0F172A] font-bold text-lg mb-2">Delete Loan?</h3>
            <p className="text-[#64748B] text-sm mb-5">
              This will permanently delete the loan with {loan.counterpartyName} and all its payment history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-[#CBD5E1] text-[#64748B] font-semibold text-sm rounded-xl hover:border-[#0F2044] transition-colors"
              >
                Cancel
              </button>
              <Form method="post" className="flex-1">
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#EF4444] text-white font-bold text-sm rounded-xl hover:bg-[#DC2626] transition-colors"
                >
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function DetailRow({ icon, label, value, valueClass }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[#64748B] text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium text-right max-w-[55%] ${valueClass || "text-[#0F172A]"}`}>{value}</span>
    </div>
  );
}
