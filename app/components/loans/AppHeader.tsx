import { Bell } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  backHref?: string;
}

export function AppHeader({ title, subtitle, rightElement, backHref }: AppHeaderProps) {
  const { config, loading } = useConfigurables();
  const appName = loading ? "Loan Book" : (config?.appName ?? "Loan Book");

  return (
    <header className="sticky top-0 z-40 bg-[#0F2044] shadow-lg">
      <div className="max-w-[480px] mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <a href={backHref} className="text-white/70 hover:text-white mr-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
            </a>
          )}
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              {title || appName}
            </h1>
            {subtitle && (
              <p className="text-[#94A3B8] text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {rightElement || (
          <button className="relative text-[#94A3B8] hover:text-white p-1 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
