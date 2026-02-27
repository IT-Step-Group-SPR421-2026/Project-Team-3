import { IconLeaf, IconPlus } from "../icons/Icons";
import { formatHeaderDate } from "../../utils/dateHelpers";
import "./AppHeader.css";

export default function AppHeader({ onAddHabit }) {
  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="app-logo-mark">
          <IconLeaf />
        </div>
        <span className="app-logo-name">Habits</span>
      </div>
      <span className="app-header-date">{formatHeaderDate()}</span>
      <button className="btn-add-habit" onClick={onAddHabit}>
        <IconPlus /> Add Habit
      </button>
    </header>
  );
}
