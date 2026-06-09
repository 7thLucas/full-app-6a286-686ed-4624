import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { ForgotPasswordCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await AuthService.forgotPassword(String(formData.get("email") ?? ""));
  } catch {}
  return { success: true, message: "If that email exists, a reset link has been sent. Check your inbox." };
}

export default function ForgotPasswordRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F2044]">Loan Book</h1>
          <p className="text-[#64748B] mt-1 text-sm">Reset your password</p>
        </div>
        <ForgotPasswordCard />
        <p className="text-center text-sm text-[#64748B] mt-4">
          <a href="/auth/login" className="text-[#F5A623] font-semibold hover:underline">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
