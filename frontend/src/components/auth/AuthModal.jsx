import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { IconLeaf } from "../icons/Icons";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
  const { t } = useTranslation();
  const { signInGoogle } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  // ── Entrance animation ──────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: "power2.out" },
    );
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 28, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "back.out(1.6)" },
    );
  }, []);

  const dismiss = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.18,
      onComplete: onClose,
    });
    gsap.to(cardRef.current, { y: 16, opacity: 0, duration: 0.18 });
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err) {
      const map = {
        "auth/popup-closed-by-user": t("auth.errorCancelled"),
        "auth/too-many-requests": t("auth.errorTooMany"),
        "auth/cancelled-popup-request": t("auth.errorCancelled"),
      };
      setError(map[err.code] ?? t("auth.errorGeneric"));
      gsap.fromTo(
        cardRef.current,
        { x: -6 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" },
      );
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && dismiss()}
    >
      <div className="auth-card" ref={cardRef}>
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-logo-mark">
            <IconLeaf />
          </div>
          <button
            className="auth-close-btn"
            onClick={dismiss}
            aria-label={t("auth.close")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <h2 className="auth-title">{t("auth.title")}</h2>
        <p className="auth-subtitle">{t("auth.subtitle")}</p>

        <button
          className="auth-google-btn"
          onClick={handleGoogle}
          disabled={busy}
        >
          {busy ? (
            <span className="auth-spinner" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.2a10.34 10.34 0 0 0-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908C16.658 14.252 17.64 11.946 17.64 9.2z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.continueGoogle")}
            </>
          )}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>,
    document.body,
  );
}
