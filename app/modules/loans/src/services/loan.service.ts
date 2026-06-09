import { LoanModel, LoanStatus, LoanType, PaymentRecord } from "../models/loan.model";

export interface CreateLoanInput {
  userId: string;
  type: LoanType;
  counterpartyName: string;
  principalAmount: number;
  interestRate?: number;
  startDate: Date;
  dueDate: Date;
  repaymentSchedule?: string;
  notes?: string;
}

export interface AddPaymentInput {
  loanId: string;
  userId: string;
  amount: number;
  date: Date;
  notes?: string;
}

function computeStatus(loan: { dueDate: Date; totalPaid: number; principalAmount: number }): LoanStatus {
  const remaining = loan.principalAmount - loan.totalPaid;
  if (remaining <= 0) return LoanStatus.Paid;
  if (new Date() > new Date(loan.dueDate)) return LoanStatus.Overdue;
  return LoanStatus.Active;
}

export class LoanService {
  static async createLoan(input: CreateLoanInput) {
    const loan = new LoanModel({
      ...input,
      totalPaid: 0,
      status: computeStatus({ dueDate: input.dueDate, totalPaid: 0, principalAmount: input.principalAmount }),
      payments: [],
    });
    await loan.save();
    return loan;
  }

  static async getLoansForUser(userId: string, status?: string) {
    // Recompute statuses first
    await LoanService.refreshStatuses(userId);
    const query: Record<string, any> = { userId };
    if (status && status !== "all") {
      query.status = status;
    }
    const loans = await LoanModel.find(query).sort({ dueDate: 1 });
    return loans;
  }

  static async getLoanById(loanId: string, userId: string) {
    const loan = await LoanModel.findOne({ _id: loanId, userId });
    return loan;
  }

  static async updateLoan(loanId: string, userId: string, update: Partial<CreateLoanInput>) {
    const loan = await LoanModel.findOneAndUpdate(
      { _id: loanId, userId },
      { $set: update },
      { new: true }
    );
    if (loan) {
      loan.status = computeStatus({ dueDate: loan.dueDate, totalPaid: loan.totalPaid, principalAmount: loan.principalAmount });
      await loan.save();
    }
    return loan;
  }

  static async deleteLoan(loanId: string, userId: string) {
    const result = await LoanModel.deleteOne({ _id: loanId, userId });
    return result.deletedCount > 0;
  }

  static async addPayment(input: AddPaymentInput) {
    const loan = await LoanModel.findOne({ _id: input.loanId, userId: input.userId });
    if (!loan) throw new Error("Loan not found");

    const payment: PaymentRecord = {
      amount: input.amount,
      date: input.date,
      notes: input.notes,
    };

    loan.payments.push(payment);
    loan.totalPaid = (loan.totalPaid || 0) + input.amount;
    loan.status = computeStatus({ dueDate: loan.dueDate, totalPaid: loan.totalPaid, principalAmount: loan.principalAmount });
    await loan.save();
    return loan;
  }

  static async getDashboardSummary(userId: string) {
    await LoanService.refreshStatuses(userId);
    const loans = await LoanModel.find({ userId });

    let totalOwed = 0;
    let totalLent = 0;
    let overdueCount = 0;

    for (const loan of loans) {
      const remaining = loan.principalAmount - (loan.totalPaid || 0);
      if (remaining <= 0) continue;
      if (loan.type === LoanType.Borrowed) {
        totalOwed += remaining;
      } else {
        totalLent += remaining;
      }
      if (loan.status === LoanStatus.Overdue) overdueCount++;
    }

    return { totalOwed, totalLent, overdueCount };
  }

  static async getUpcomingPayments(userId: string, daysWindow: number = 14) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysWindow * 24 * 60 * 60 * 1000);
    const loans = await LoanModel.find({
      userId,
      status: { $in: [LoanStatus.Active, LoanStatus.Overdue] },
      dueDate: { $lte: cutoff },
    }).sort({ dueDate: 1 }).limit(5);
    return loans;
  }

  private static async refreshStatuses(userId: string) {
    const loans = await LoanModel.find({ userId, status: { $ne: LoanStatus.Paid } });
    for (const loan of loans) {
      const newStatus = computeStatus({ dueDate: loan.dueDate, totalPaid: loan.totalPaid, principalAmount: loan.principalAmount });
      if (newStatus !== loan.status) {
        loan.status = newStatus;
        await loan.save();
      }
    }
  }
}
