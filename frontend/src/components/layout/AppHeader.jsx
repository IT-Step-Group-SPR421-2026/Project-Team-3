import { useNavigate } from "react-router-dom";
import { IconLeaf, IconPlus } from "../icons/Icons";
import { formatHeaderDate } from "../../utils/dateHelpers";
import "./AppHeader.css";

export default function AppHeader({ onAddHabit }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
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
      <span className="app-header-date">{formatHeaderDate()}</span>
      <button className="btn-add-habit" onClick={onAddHabit}>
        <IconPlus /> Add Habit
      </button>
    </header>
  );
}
