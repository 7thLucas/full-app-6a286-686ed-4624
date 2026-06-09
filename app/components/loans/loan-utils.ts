export function formatCurrency(amount: number, symbol = "$"): string {
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntilDue(dueDate: string | Date): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "active":
      return { bg: "bg-[#1A3560]", text: "text-white" };
    case "overdue":
      return { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" };
    case "paid":
      return { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

export function getRepaymentLabel(schedule: string): string {
  const map: Record<string, string> = {
    one_time: "One-time",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    custom: "Custom",
  };
  return map[schedule] || schedule;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function calculateRepaymentProgress(principalAmount: number, totalPaid: number): number {
  if (principalAmount <= 0) return 100;
  return Math.min(100, Math.round((totalPaid / principalAmount) * 100));
}

export function calculateTotalWithInterest(
  principal: number,
  ratePercent: number,
  termMonths: number,
  mode: "simple" | "compound"
): { totalInterest: number; totalRepayment: number } {
  if (mode === "simple") {
    const totalInterest = (principal * ratePercent * termMonths) / (100 * 12);
    return { totalInterest, totalRepayment: principal + totalInterest };
  } else {
    const monthlyRate = ratePercent / 100 / 12;
    const totalRepayment = principal * Math.pow(1 + monthlyRate, termMonths);
    return { totalInterest: totalRepayment - principal, totalRepayment };
  }
}
