import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppHeader } from "~/components/loans/AppHeader";
import { BottomNav } from "~/components/loans/BottomNav";
import { useConfigurables } from "~/modules/configurables";
import { formatCurrency, calculateTotalWithInterest } from "~/components/loans/loan-utils";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

const INPUT_CLASS =
  "w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition-colors";
const LABEL_CLASS = "block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5";

export default function CalculatorPage() {
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol ?? "$";

  const [mode, setMode] = useState<"simple" | "compound">("simple");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<{ totalInterest: number; totalRepayment: number } | null>(null);

  function calculate() {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(term);
    if (!p || !r || !t || p <= 0 || r < 0 || t <= 0) return;
    setResult(calculateTotalWithInterest(p, r, t, mode));
  }

  function reset() {
    setPrincipal("");
    setRate("");
    setTerm("");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader title="Interest Calculator" />

      <main className="max-w-[480px] mx-auto pb-28 px-5 pt-5 space-y-5">
        {/* Mode Toggle */}
        <div>
          <label className={LABEL_CLASS}>Calculation Mode</label>
          <div className="grid grid-cols-2 gap-2 bg-white border border-[#E2E8F0] rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => { setMode("simple"); setResult(null); }}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "simple"
                  ? "bg-[#0F2044] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Simple Interest
            </button>
            <button
              type="button"
              onClick={() => { setMode("compound"); setResult(null); }}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "compound"
                  ? "bg-[#0F2044] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Compound Interest
            </button>
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-2 px-1">
            {mode === "simple"
              ? "Simple: Interest = Principal × Rate × Time"
              : "Compound: A = P(1 + r/n)^(nt), compounded monthly"}
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
          <div>
            <label className={LABEL_CLASS}>Principal Amount ({symbol})</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => { setPrincipal(e.target.value); setResult(null); }}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Annual Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => { setRate(e.target.value); setResult(null); }}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Loan Term (months)</label>
            <input
              type="number"
              value={term}
              onChange={(e) => { setTerm(e.target.value); setResult(null); }}
              min="1"
              step="1"
              placeholder="12"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3.5 border-2 border-[#0F2044] text-[#0F2044] font-bold text-sm rounded-2xl hover:bg-[#0F2044]/5 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={calculate}
            className="flex-[2] py-3.5 bg-[#F5A623] text-[#0F2044] font-bold text-[15px] rounded-2xl hover:bg-[#e8961a] active:scale-[0.97] transition-all duration-200 shadow-md"
          >
            Calculate
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-[#0F2044] rounded-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[#94A3B8] text-xs uppercase tracking-widest font-medium mb-4">Calculation Result</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm">Principal</span>
                <span className="text-white font-semibold">{formatCurrency(parseFloat(principal), symbol)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm">Total Interest</span>
                <span className="text-[#F5A623] font-semibold">{formatCurrency(result.totalInterest, symbol)}</span>
              </div>
              <div className="h-px bg-[#1A3560]" />
              <div className="flex justify-between items-center">
                <span className="text-white text-base font-semibold">Total Repayment</span>
                <span className="text-white font-bold text-xl">{formatCurrency(result.totalRepayment, symbol)}</span>
              </div>
            </div>

            <div className="mt-4 bg-[#1A3560] rounded-xl px-4 py-3">
              <p className="text-[#94A3B8] text-xs">
                {parseFloat(rate)}% p.a. {mode} interest over {term} month{parseFloat(term) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h3 className="text-[#0F172A] font-semibold text-sm mb-3">How it works</h3>
          <div className="space-y-2">
            <p className="text-[#64748B] text-xs">
              <span className="font-semibold text-[#0F172A]">Simple Interest:</span> Calculated only on the original principal. Formula: I = P × r × t
            </p>
            <p className="text-[#64748B] text-xs">
              <span className="font-semibold text-[#0F172A]">Compound Interest:</span> Interest is calculated on both the principal and accumulated interest, compounded monthly.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
