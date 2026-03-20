import { useEffect, useRef, useCallback, type CSSProperties } from "react";
import {
  Globe,
  FileText,
  Mail,
  Sparkles,
  LayoutTemplate,
  User,
} from "lucide-react";
import type { PortalId } from "milkly-shared/types";
import { authClient } from "@/lib/auth-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Globe;
  action: () => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "hsla(20 10% 15% / 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  padding: "1rem",
};

const dialogStyle: CSSProperties = {
  width: "100%",
  maxWidth: "400px",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-lg)",
  boxShadow: "var(--milkly-shadow-lg)",
  padding: "1rem 0",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  overflow: "hidden",
};

const headingStyle: CSSProperties = {
  margin: "0 0 0.75rem",
  padding: "0 1.25rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--milkly-fg-tertiary)",
};

const listStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.875rem",
  width: "100%",
  padding: "0.75rem 1.25rem",
  fontSize: "0.9375rem",
  fontWeight: 500,
  color: "var(--milkly-fg-primary)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
  textAlign: "left",
  transition: "background 0.12s ease",
  outline: "none",
  borderRadius: 0,
};

const menuItemFocusStyle: CSSProperties = {
  ...menuItemStyle,
  background: "var(--milkly-bg-secondary)",
};

const iconContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-bg-tertiary)",
  flexShrink: 0,
};

const iconStyle: CSSProperties = {
  width: "1.125rem",
  height: "1.125rem",
  color: "var(--milkly-fg-secondary)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface MenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuDialog({
  isOpen,
  onClose,
}: MenuDialogProps): JSX.Element | null {
  const listRef = useRef<HTMLUListElement>(null);
  const focusIndexRef = useRef(0);

  // Build the menu items
  const handleSsoRedirect = useCallback(
    (portal: PortalId, returnPath?: string) => {
      onClose();
      void authClient.ssoRedirect(portal, returnPath);
    },
    [onClose],
  );

  const menuItems: MenuItem[] = [
    {
      id: "publish",
      label: "Publish on News",
      icon: Globe,
      action: () => {
        handleSsoRedirect("news", "/publish");
      },
    },
    {
      id: "newsletters",
      label: "My Newsletters",
      icon: FileText,
      action: () => {
        handleSsoRedirect("news");
      },
    },
    {
      id: "email",
      label: "Email Distribution",
      icon: Mail,
      action: () => {
        handleSsoRedirect("email");
      },
    },
    {
      id: "ai",
      label: "AI Generate",
      icon: Sparkles,
      action: () => {
        handleSsoRedirect("ai");
      },
    },
    {
      id: "templates",
      label: "Templates",
      icon: LayoutTemplate,
      action: () => {
        // Placeholder — internal action
        onClose();
      },
    },
    {
      id: "account",
      label: "Account",
      icon: User,
      action: () => {
        // Placeholder — settings panel
        onClose();
      },
    },
  ];

  // Focus the first menu item when the dialog opens
  useEffect(() => {
    if (!isOpen) return;
    focusIndexRef.current = 0;
    // Slight delay to let DOM render
    const timerId = setTimeout(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]',
      );
      buttons?.[0]?.focus();
    }, 0);
    return () => {
      clearTimeout(timerId);
    };
  }, [isOpen]);

  // Keyboard navigation: Escape, Tab, Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]',
      );
      if (!buttons || buttons.length === 0) return;

      const count = buttons.length;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
        event.preventDefault();
        focusIndexRef.current = (focusIndexRef.current + 1) % count;
        buttons[focusIndexRef.current]?.focus();
        return;
      }

      if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
        event.preventDefault();
        focusIndexRef.current =
          (focusIndexRef.current - 1 + count) % count;
        buttons[focusIndexRef.current]?.focus();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusIndexRef.current = 0;
        buttons[0]?.focus();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusIndexRef.current = count - 1;
        buttons[count - 1]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      role="presentation"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-dialog-title"
        style={dialogStyle}
      >
        <h2 id="menu-dialog-title" style={headingStyle}>
          Menu
        </h2>
        <ul ref={listRef} role="menu" style={listStyle}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  type="button"
                  style={menuItemStyle}
                  onClick={item.action}
                  onFocus={(e) => {
                    e.currentTarget.style.background =
                      menuItemFocusStyle.background as string;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      menuItemFocusStyle.background as string;
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  aria-label={item.label}
                >
                  <span style={iconContainerStyle} aria-hidden="true">
                    <IconComponent style={iconStyle} />
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
