import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import saltyPickleIcon from "@/assets/salty-pickle-icon.png";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/plans", icon: ClipboardList, label: "Plans" },
  { to: "/app/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/app/preferences", icon: Settings, label: "Settings" },
];

export default function AppLayout() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar-background p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src={saltyPickleIcon} alt="Salty Pickle" className="w-8 h-8" />
          <span className="font-display text-lg text-sidebar-foreground tracking-wider">
            SALTY PICKLE
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-body text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={saltyPickleIcon} alt="" className="w-6 h-6" />
          <span className="font-display text-sm tracking-wider text-foreground">SALTY PICKLE</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 pt-16 px-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-base font-body transition-colors ${
                    isActive
                      ? "bg-muted text-primary font-semibold"
                      : "text-foreground/70 hover:text-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-base font-body text-destructive w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
