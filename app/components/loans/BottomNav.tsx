import { Link, useLocation } from "react-router";
import { LayoutDashboard, List, Calculator, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loans", label: "Loans", icon: List },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F2044] border-t border-[#1A3560] safe-area-inset-bottom">
      <div className="max-w-[480px] mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                active ? "text-[#F5A623]" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-[#F5A623]" : "text-[#94A3B8]"}
              />
              <span className={`text-[10px] font-medium tracking-wide ${active ? "text-[#F5A623]" : "text-[#94A3B8]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
