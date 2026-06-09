/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "appTagline",
      type: "string",
      required: false,
      label: "App Tagline",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary (Deep Navy)",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary (Rich Navy)",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent (Amber Gold)",
        },
      ],
    },
    {
      fieldName: "currencySymbol",
      type: "string",
      required: false,
      label: "Currency Symbol",
    },
    {
      fieldName: "dashboardWelcomeMessage",
      type: "string",
      required: false,
      label: "Dashboard Welcome Message",
    },
    {
      fieldName: "addLoanCTALabel",
      type: "string",
      required: false,
      label: "Add Loan Button Label",
    },
    {
      fieldName: "enableInterestCalculator",
      type: "boolean",
      required: false,
      label: "Enable Interest Calculator",
    },
    {
      fieldName: "enableDueDateReminders",
      type: "boolean",
      required: false,
      label: "Enable Due Date Reminders",
    },
    {
      fieldName: "upcomingPaymentsDaysWindow",
      type: "number",
      required: false,
      label: "Upcoming Payments Days Window",
      min: 1,
      max: 90,
    },
  ],
};