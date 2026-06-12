import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/log", label: "Log Activity", icon: PlusCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/community", label: "Community", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Sidebar navigation with responsive behavior */
export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps): React.ReactElement {
  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-64 z-40 glass border-r border-white/10 dark:border-dark-700/30
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="flex flex-col gap-1 p-4 pt-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="glass-card p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/50 dark:to-primary-900/30">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-1">
            🌱 Eco Tip
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-500 leading-relaxed">
            Switching to plant-based meals one day per week can save ~30 kg CO₂
            per month.
          </p>
        </div>
      </div>
    </aside>
  );
}
