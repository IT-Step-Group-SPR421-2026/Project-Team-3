import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconLeaf } from "../icons/Icons";
import { formatHeaderDate } from "../../utils/dateHelpers";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";
import AuthModal from "../auth/AuthModal";
import "./AppHeader.css";

export default function AppHeader() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="app-header">
        {/* Left — back + logo */}
        <div className="app-header-left">
          <button
            className="back-button"
            onClick={() => navigate("/")}
            title="Back to home"
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
        <span className="app-header-date">{formatHeaderDate()}</span>

        {/* Right — auth */}
        <div className="app-header-right">
          {!loading &&
            (user ? (
              <UserMenu />
            ) : (
              <button className="btn-sign-in" onClick={() => setShowAuth(true)}>
                Sign in
              </button>
            ))}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
