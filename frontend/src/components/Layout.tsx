import { Outlet, NavLink, useNavigate } from "react-router";
import { Activity, LayoutDashboard, LogOut } from "lucide-react";
import { clearApiKey } from "../api/client";

export function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearApiKey();
    navigate("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar — same canvas background, border separation */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-edge)] bg-[var(--color-canvas)]">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5">
          <Activity size={18} className="text-[var(--color-signal)]" />
          <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            PixelPulse
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          <SidebarLink to="/" icon={<LayoutDashboard size={15} />} label="Dashboard" />
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
      <main className="flex-1 overflow-y-auto bg-[var(--color-canvas)]">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
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
