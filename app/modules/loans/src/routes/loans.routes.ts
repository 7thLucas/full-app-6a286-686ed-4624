import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { LoanService } from "../services/loan.service";

const router = Router();

// GET /api/loans — list loans for the current user
router.get("/api/loans", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const { status } = req.query;
    const loans = await LoanService.getLoansForUser(userId, status as string | undefined);
    res.json({ loans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/summary — dashboard summary
router.get("/api/loans/summary", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const summary = await LoanService.getDashboardSummary(userId);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/upcoming — upcoming payments
router.get("/api/loans/upcoming", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const days = parseInt((req.query.days as string) || "14", 10);
    const loans = await LoanService.getUpcomingPayments(userId, days);
    res.json({ loans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/:id — get a single loan
router.get("/api/loans/:id", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const loan = await LoanService.getLoanById(String(req.params.id), userId);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.json({ loan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans — create a loan
router.post("/api/loans", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const { type, counterpartyName, principalAmount, interestRate, startDate, dueDate, repaymentSchedule, notes } = req.body;

    if (!type || !counterpartyName || !principalAmount || !startDate || !dueDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const loan = await LoanService.createLoan({
      userId,
      type,
      counterpartyName,
      principalAmount: Number(principalAmount),
      interestRate: interestRate ? Number(interestRate) : 0,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      repaymentSchedule,
      notes,
    });

    res.status(201).json({ loan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/loans/:id — update a loan
router.put("/api/loans/:id", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const loan = await LoanService.updateLoan(String(req.params.id), userId, req.body);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.json({ loan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/loans/:id — delete a loan
router.delete("/api/loans/:id", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const deleted = await LoanService.deleteLoan(String(req.params.id), userId);
    if (!deleted) return res.status(404).json({ error: "Loan not found" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans/:id/payments — add a payment to a loan
router.post("/api/loans/:id/payments", requireAuth, async (req, res) => {
  try {
    const userId = String((req as any).user?.sub ?? "");
    const { amount, date, notes } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ error: "Amount and date are required" });
    }

    const loan = await LoanService.addPayment({
      loanId: String(req.params.id),
      userId,
      amount: Number(amount),
      date: new Date(date),
      notes,
    });

    res.json({ loan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
