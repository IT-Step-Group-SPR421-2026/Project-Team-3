import "./StatsPanel.css";

export default function StatsPanel({
  maxCurrentStreak,
  doneTodayCount,
  totalHabits,
  stats,
}) {
  return (
    <div className="stats-body">
      <div className="streak-hero">
        <div className="streak-hero-icon">🔥</div>
        <div>
          <div className="streak-hero-label">Best active streak</div>
          <div className="streak-hero-value">
            {maxCurrentStreak > 0 ? `${maxCurrentStreak} days` : "—"}
          </div>
          <div className="streak-hero-sub">
            {maxCurrentStreak > 0 ? "Keep it going!" : "Start a streak today"}
          </div>
        </div>
      </div>

      <div className="stats-grid-2">
        <div className="stat-card">
          <div className="stat-label">Completed today</div>
          <div
            className={`stat-value ${doneTodayCount === totalHabits && totalHabits > 0 ? "accent" : ""}`}
          >
            {doneTodayCount} / {totalHabits}
          </div>
          <div className="stat-sub">habits done</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All-time total</div>
          <div className="stat-value">{stats?.total_completed ?? 0}</div>
          <div className="stat-sub">completions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total habits</div>
          <div className="stat-value">{stats?.habits_count ?? 0}</div>
          <div className="stat-sub">tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This week</div>
          <div className="stat-value">
            {stats?.weekly?.slice(-1)[0]?.count ?? 0}
          </div>
          <div className="stat-sub">check-ins</div>
        </div>
      </div>
    </div>
  );
}
