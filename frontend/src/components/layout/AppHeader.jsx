import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconLeaf } from "../icons/Icons";
import { formatHeaderDate } from "../../utils/dateHelpers";
import { getDateLocale } from "../../utils/locale";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";
import AuthModal from "../auth/AuthModal";
import "./AppHeader.css";

export default function AppHeader() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const locale = getDateLocale(i18n.resolvedLanguage);

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "uk", label: "Українська" },
    { code: "de", label: "Deutsch" },
    { code: "pl", label: "Polski" },
    { code: "ko", label: "한국어" },
  ];

  const handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <header className="app-header">
        {/* Left — back + logo */}
        <div className="app-header-left">
          <button
            className="back-button"
            onClick={() => navigate("/")}
            title={t("header.backHome")}
          >
            ←
          </button>
          <div className="app-logo">
            <div className="app-logo-mark">
              <IconLeaf />
            </div>
            <span className="app-logo-name">Habitflow</span>
          </div>
        </div>

        {/* Center — date */}
        <span className="app-header-date">{formatHeaderDate(locale)}</span>

        {/* Right — auth */}
        <div className="app-header-right">
          <div
            className="lang-switch"
            aria-label={t("header.language")}
            role="group"
          >
            <label className="lang-select-label" htmlFor="lang-select">
              {t("header.language")}
            </label>
            <select
              id="lang-select"
              className="lang-select"
              value={i18n.resolvedLanguage || "en"}
              onChange={(e) => handleLangChange(e.target.value)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {!loading &&
            (user ? (
              <UserMenu />
            ) : (
              <button className="btn-sign-in" onClick={() => setShowAuth(true)}>
                {t("header.signIn")}
              </button>
            ))}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
