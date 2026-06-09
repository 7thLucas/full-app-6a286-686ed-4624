import { redirect, useActionData, Form } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { LoanService } from "~/modules/loans/src/services/loan.service";
import { LoanType } from "~/modules/loans/src/models/loan.model";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { useConfigurables } from "~/modules/configurables";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();

  try {
    await LoanService.createLoan({
      userId: user.id,
      type: String(formData.get("type")) as LoanType,
      counterpartyName: String(formData.get("counterpartyName")),
      principalAmount: Number(formData.get("principalAmount")),
      interestRate: formData.get("interestRate") ? Number(formData.get("interestRate")) : 0,
      startDate: new Date(String(formData.get("startDate"))),
      dueDate: new Date(String(formData.get("dueDate"))),
      repaymentSchedule: String(formData.get("repaymentSchedule")) || "one_time",
      notes: String(formData.get("notes") || ""),
    });

    return redirect("/loans");
  } catch (error: any) {
    return { error: error.message ?? "Failed to create loan" };
  }
}

const INPUT_CLASS =
  "w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-colors";

const LABEL_CLASS = "block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5";

export default function NewLoanPage() {
  const actionData = useActionData<typeof action>();
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";
  const [loanType, setLoanType] = useState<"borrowed" | "lent">("borrowed");

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader title="Add Loan" backHref="/loans" />

      <main className="max-w-[480px] mx-auto pb-28 px-5 pt-5">
        <Form method="post" className="space-y-5">
          {actionData?.error && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3">
              <p className="text-[#DC2626] text-sm">{actionData.error}</p>
            </div>
          )}

          {/* Loan Type Toggle */}
          <div>
            <label className={LABEL_CLASS}>Loan Type</label>
            <input type="hidden" name="type" value={loanType} />
            <div className="grid grid-cols-2 gap-2 bg-white border border-[#E2E8F0] rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setLoanType("borrowed")}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  loanType === "borrowed"
                    ? "bg-[#0F2044] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                I Borrowed
              </button>
              <button
                type="button"
                onClick={() => setLoanType("lent")}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  loanType === "lent"
                    ? "bg-[#F5A623] text-[#0F2044] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                I Lent
              </button>
            </div>
          </div>

          {/* Counterparty Name */}
          <div>
            <label htmlFor="counterpartyName" className={LABEL_CLASS}>
              {loanType === "borrowed" ? "Lender Name" : "Borrower Name"}
            </label>
            <input
              id="counterpartyName"
              type="text"
              name="counterpartyName"
              required
              placeholder={loanType === "borrowed" ? "e.g. John Smith" : "e.g. Jane Doe"}
              className={INPUT_CLASS}
            />
          </div>

          {/* Principal Amount */}
          <div>
            <label htmlFor="principalAmount" className={LABEL_CLASS}>
              Principal Amount ({symbol})
            </label>
            <input
              id="principalAmount"
              type="number"
              name="principalAmount"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLASS}
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label htmlFor="interestRate" className={LABEL_CLASS}>
              Interest Rate (% per year) <span className="normal-case text-[#94A3B8] font-normal">optional</span>
            </label>
            <input
              id="interestRate"
              type="number"
              name="interestRate"
              min="0"
              step="0.01"
              placeholder="0"
              className={INPUT_CLASS}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className={LABEL_CLASS}>Start Date</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                required
                defaultValue={today}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="dueDate" className={LABEL_CLASS}>Due Date</label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                required
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Repayment Schedule */}
          <div>
            <label htmlFor="repaymentSchedule" className={LABEL_CLASS}>Repayment Schedule</label>
            <select
              id="repaymentSchedule"
              name="repaymentSchedule"
              className={INPUT_CLASS}
            >
              <option value="one_time">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={LABEL_CLASS}>
              Notes <span className="normal-case text-[#94A3B8] font-normal">optional</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any additional notes about this loan..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#F5A623] text-[#0F2044] font-bold text-[15px] py-4 rounded-2xl hover:bg-[#e8961a] active:scale-[0.97] transition-all duration-200 shadow-md"
          >
            Save Loan
          </button>
        </Form>
      </main>

      <BottomNav />
    </div>
  );
}
