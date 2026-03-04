import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "../../contexts/AuthContext";
import "./UserMenu.css";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Animate dropdown open/close
  useEffect(() => {
    const menu = dropdownRef.current?.querySelector(".user-menu-dropdown");
    if (!menu) return;
    if (open) {
      gsap.fromTo(
        menu,
        { opacity: 0, y: -8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "back.out(1.8)" },
      );
    }
  }, [open]);

  const initial =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "?";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button
        className={`user-avatar-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="User menu"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="user-avatar-img"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="user-avatar-initial">{initial}</span>
        )}
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-info">
            <span className="user-menu-name">{displayName}</span>
            <span className="user-menu-email">{user?.email}</span>
          </div>
          <div className="user-menu-divider" />
          <button className="user-menu-item danger" onClick={handleLogout}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
