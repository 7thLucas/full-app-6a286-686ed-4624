/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  appTagline?: string;
  logoUrl: string;
  brandColor: TBrandColor;
  currencySymbol?: string;
  dashboardWelcomeMessage?: string;
  addLoanCTALabel?: string;
  enableInterestCalculator?: boolean;
  enableDueDateReminders?: boolean;
  upcomingPaymentsDaysWindow?: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Loan Book",
  appTagline: "Every Loan. Every Payment. One Place.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#0F2044",
    secondary: "#1A3560",
    accent: "#F5A623",
  },
  currencySymbol: "$",
  dashboardWelcomeMessage: "Your loan overview at a glance.",
  addLoanCTALabel: "Add Loan",
  enableInterestCalculator: true,
  enableDueDateReminders: true,
  upcomingPaymentsDaysWindow: 14,
};
