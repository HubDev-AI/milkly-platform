import type { CSSProperties, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, Send, History, LogOut, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface DashboardLayoutProps {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const layoutStyle: CSSProperties = {
  display: "flex",
  minHeight: "100dvh",
  fontFamily: "var(--milkly-font-sans)",
  background: "var(--milkly-bg-primary)",
  color: "var(--milkly-fg-primary)",
};

const sidebarStyle: CSSProperties = {
  width: 260,
  minWidth: 260,
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem 0",
};

const brandAreaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0 1.5rem 1.5rem",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  marginBottom: "0.5rem",
};

const brandIconStyle: CSSProperties = {
  color: "var(--milkly-brand)",
  flexShrink: 0,
};

const brandTextStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  letterSpacing: "-0.01em",
};

const navStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  padding: "0.5rem 0.75rem",
  flex: 1,
};

const baseLinkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.625rem 0.75rem",
  borderRadius: "var(--milkly-radius-md)",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  transition: "background 150ms ease, color 150ms ease",
};

const activeLinkExtraStyle: CSSProperties = {
  background: "rgba(0, 0, 0, 0.05)",
  color: "var(--milkly-fg-primary)",
  fontWeight: 600,
};

const sidebarFooterStyle: CSSProperties = {
  padding: "0.75rem 1.5rem",
  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
  marginTop: "auto",
};

const userInfoStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  marginBottom: "0.75rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const logoutBtnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
  borderRadius: "var(--milkly-radius-md)",
  width: "100%",
  textAlign: "left",
};

const mainStyle: CSSProperties = {
  flex: 1,
  padding: "2rem 2.5rem",
  overflowY: "auto",
  maxWidth: 1100,
};

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subscribers", label: "Subscribers", icon: Users },
  { to: "/send", label: "Send Newsletter", icon: Send },
  { to: "/history", label: "Distribution History", icon: History },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    retry: false,
    staleTime: 30_000,
  });

  async function handleLogout(): Promise<void> {
    try {
      await authClient.logout();
    } catch {
      // Best-effort: clear local state even if server-side logout failed
    }
    queryClient.clear();
    navigate("/");
  }

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle} aria-label="Sidebar navigation">
        <div style={brandAreaStyle}>
          <Mail size={22} style={brandIconStyle} aria-hidden="true" />
          <span style={brandTextStyle}>Milkly Email</span>
        </div>

        <nav style={navStyle}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) =>
                isActive
                  ? { ...baseLinkStyle, ...activeLinkExtraStyle }
                  : baseLinkStyle
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={sidebarFooterStyle}>
          {user ? (
            <p style={userInfoStyle} title={user.email}>
              {user.name ?? user.email}
            </p>
          ) : null}
          <button
            type="button"
            style={logoutBtnStyle}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={mainStyle}>{children}</main>
    </div>
  );
}
