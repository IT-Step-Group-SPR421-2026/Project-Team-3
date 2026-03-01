import { useState } from "react";
import "./StatsPanel.css";

export default function StatsPanel({
  maxCurrentStreak,
  doneTodayCount,
  totalHabits,
  stats,
}) {
  const [bucketView, setBucketView] = useState("weekly");

  const weekly = stats?.weekly || [];
  const monthly = stats?.monthly || [];

  // Get last 8 weeks or 6 months
  const recentWeeks = weekly.slice(-8);
  const recentMonths = monthly.slice(-6);

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

      {/* Weekly/Monthly buckets */}
      <div className="buckets-section">
        <div className="buckets-header">
          <span className="buckets-title">Activity trend</span>
          <div className="bucket-toggle">
            <button
              className={`bucket-toggle-btn ${bucketView === "weekly" ? "active" : ""}`}
              onClick={() => setBucketView("weekly")}
            >
              Weekly
            </button>
            <button
              className={`bucket-toggle-btn ${bucketView === "monthly" ? "active" : ""}`}
              onClick={() => setBucketView("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="buckets-list">
          {bucketView === "weekly" ? (
            recentWeeks.length > 0 ? (
              recentWeeks.map((bucket, i) => {
                const date = new Date(bucket.week_start);
                const label = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div key={i} className="bucket-item">
                    <span className="bucket-label">{label}</span>
                    <div className="bucket-bar-wrap">
                      <div
                        className="bucket-bar"
                        style={{
                          width: `${Math.min((bucket.count / 50) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="bucket-count">{bucket.count}</span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No weekly data yet</div>
            )
          ) : recentMonths.length > 0 ? (
            recentMonths.map((bucket, i) => {
              const date = new Date(bucket.month_start);
              const label = date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
              return (
                <div key={i} className="bucket-item">
                  <span className="bucket-label">{label}</span>
                  <div className="bucket-bar-wrap">
                    <div
                      className="bucket-bar"
                      style={{
                        width: `${Math.min((bucket.count / 150) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="bucket-count">{bucket.count}</span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No monthly data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
