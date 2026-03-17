import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utils/api";
import SubscriptionModal from "../subscription/SubscriptionModal";
import "./UserMenu.css";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  // Fetch subscription status when menu opens
  useEffect(() => {
    if (!open || !user) return;

    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const data = await apiFetch("/subscriptions/status/");
        setSubscriptionStatus(data);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
        setSubscriptionStatus(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [open, user]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const clickedInsideButton = buttonRef.current?.contains(e.target);
      const clickedInsidePortal = portalRef.current?.contains(e.target);
      if (!clickedInsideButton && !clickedInsidePortal) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Animate dropdown open/close
  useEffect(() => {
    // position portal when opening and keep it updated on resize/scroll
    function updatePos() {
      const btn = buttonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setPos({ top: Math.round(r.bottom + 8), right: Math.round(window.innerWidth - r.right) });
    }

    if (open) {
      updatePos();
      window.addEventListener("resize", updatePos);
      window.addEventListener("scroll", updatePos, true);
    }
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    const menu = portalRef.current?.querySelector(".user-menu-dropdown");
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
    navigate("/", { replace: true });
  };

  const handleUpgradeClick = () => {
    setOpen(false);
    setShowSubscriptionModal(true);
  };

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        ref={buttonRef}
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

      {open &&
        createPortal(
          <div
            ref={portalRef}
            style={{ top: `${pos.top}px`, right: `${pos.right}px` }}
            className="user-menu-dropdown portal"
          >
            <div className="user-menu-info">
              <span className="user-menu-name">{displayName}</span>
              <span className="user-menu-email">{user?.email}</span>
            </div>

            {/* Subscription Status Section */}
            <div className="user-menu-divider" />
            <div className="user-menu-subscription">
              {loadingSubscription ? (
                <div className="subscription-loading">
                  <span className="subscription-label">Loading subscription...</span>
                </div>
              ) : subscriptionStatus && subscriptionStatus.is_active ? (
                <div className="subscription-active">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div className="subscription-info-text">
                    <span className="subscription-label">Premium Active</span>
                    <span className="subscription-detail">Unlimited habits</span>
                  </div>
                </div>
              ) : (
                <div className="subscription-free">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="subscription-info-text">
                    <span className="subscription-label">Free Tier</span>
                    <span className="subscription-detail">5 habits limit</span>
                  </div>
                </div>
              )}
            </div>

            {!subscriptionStatus?.is_active && (
              <>
                <div className="user-menu-divider" />
                <button
                  className="user-menu-item upgrade"
                  onClick={handleUpgradeClick}
                >
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                  Upgrade to Premium
                </button>
              </>
            )}

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
          </div>,
          document.body,
        )}

      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            // Refresh subscription status
            setSubscriptionStatus(null);
          }}
        />
      )}
    </div>
  );
}
