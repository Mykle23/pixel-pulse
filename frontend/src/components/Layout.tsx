import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { Activity, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { clearApiKey } from "../api/client";

export function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    clearApiKey();
    navigate("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-56 shrink-0 flex-col border-r border-[var(--color-edge)] bg-[var(--color-canvas)] transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[var(--color-signal)]" />
            <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
              PixelPulse
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            className="flex items-center justify-center text-[var(--color-ink-tertiary)] md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          <SidebarLink
            to="/"
            icon={<LayoutDashboard size={15} />}
            label="Dashboard"
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--color-edge)] px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink-secondary)]"
          >
            <LogOut size={13} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-[var(--color-edge)] px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--color-ink-secondary)]"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-signal)]" />
            <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
              PixelPulse
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--color-canvas)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs transition-colors duration-150 ${
          isActive
            ? "bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
            : "text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
