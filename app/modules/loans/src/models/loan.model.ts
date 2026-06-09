import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum LoanType {
  Borrowed = "borrowed",
  Lent = "lent",
}

export enum LoanStatus {
  Active = "active",
  Overdue = "overdue",
  Paid = "paid",
}

export enum RepaymentSchedule {
  OneTime = "one_time",
  Weekly = "weekly",
  Biweekly = "biweekly",
  Monthly = "monthly",
  Custom = "custom",
}

export class PaymentRecord {
  @prop({ type: Number, required: true })
  amount!: number;

  @prop({ type: Date, required: true })
  date!: Date;

  @prop({ type: String })
  notes?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_loans",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Loan extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  userId!: string;

  @prop({ type: String, enum: LoanType, required: true })
  type!: LoanType;

  @prop({ type: String, required: true, trim: true })
  counterpartyName!: string;

  @prop({ type: Number, required: true })
  principalAmount!: number;

  @prop({ type: Number, default: 0 })
  interestRate!: number;

  @prop({ type: Date, required: true })
  startDate!: Date;

  @prop({ type: Date, required: true })
  dueDate!: Date;

  @prop({ type: String, enum: RepaymentSchedule, default: RepaymentSchedule.OneTime })
  repaymentSchedule!: RepaymentSchedule;

  @prop({ type: String })
  notes?: string;

  @prop({ type: Number, default: 0 })
  totalPaid!: number;

  @prop({ type: String, enum: LoanStatus, default: LoanStatus.Active })
  status!: LoanStatus;

  @prop({ type: () => [PaymentRecord], default: [] })
  payments!: PaymentRecord[];
}

export const LoanModel = getModelForClass(Loan);
