import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../utils/locale";
import "./StatsPanel.css";

export default function StatsPanel({
  maxCurrentStreak,
  doneTodayCount,
  totalHabits,
  stats,
}) {
  const { t, i18n } = useTranslation();
  const [bucketView, setBucketView] = useState("weekly");
  const locale = getDateLocale(i18n.resolvedLanguage);

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
          <div className="streak-hero-label">{t("stats.bestActiveStreak")}</div>
          <div className="streak-hero-value">
            {maxCurrentStreak > 0
              ? t("stats.days", { count: maxCurrentStreak })
              : "—"}
          </div>
          <div className="streak-hero-sub">
            {maxCurrentStreak > 0
              ? t("stats.keepGoing")
              : t("stats.startStreak")}
          </div>
        </div>
      </div>

      <div className="stats-grid-2">
        <div className="stat-card">
          <div className="stat-label">{t("stats.completedToday")}</div>
          <div
            className={`stat-value ${doneTodayCount === totalHabits && totalHabits > 0 ? "accent" : ""}`}
          >
            {doneTodayCount} / {totalHabits}
          </div>
          <div className="stat-sub">{t("stats.habitsDone")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.allTimeTotal")}</div>
          <div className="stat-value">{stats?.total_completed ?? 0}</div>
          <div className="stat-sub">{t("stats.completions")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.totalHabits")}</div>
          <div className="stat-value">{stats?.habits_count ?? 0}</div>
          <div className="stat-sub">{t("stats.tracked")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.thisWeek")}</div>
          <div className="stat-value">
            {stats?.weekly?.slice(-1)[0]?.count ?? 0}
          </div>
          <div className="stat-sub">{t("stats.checkIns")}</div>
        </div>
      </div>

      {/* Weekly/Monthly buckets */}
      <div className="buckets-section">
        <div className="buckets-header">
          <span className="buckets-title">{t("stats.activityTrend")}</span>
          <div className="bucket-toggle">
            <button
              className={`bucket-toggle-btn ${bucketView === "weekly" ? "active" : ""}`}
              onClick={() => setBucketView("weekly")}
            >
              {t("stats.weekly")}
            </button>
            <button
              className={`bucket-toggle-btn ${bucketView === "monthly" ? "active" : ""}`}
              onClick={() => setBucketView("monthly")}
            >
              {t("stats.monthly")}
            </button>
          </div>
        </div>

        <div className="buckets-list">
          {bucketView === "weekly" ? (
            recentWeeks.length > 0 ? (
              recentWeeks.map((bucket, i) => {
                const date = new Date(bucket.week_start);
                const label = date.toLocaleDateString(locale, {
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
              <div className="empty-state">{t("stats.noWeeklyData")}</div>
            )
          ) : recentMonths.length > 0 ? (
            recentMonths.map((bucket, i) => {
              const date = new Date(bucket.month_start);
              const label = date.toLocaleDateString(locale, {
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
            <div className="empty-state">{t("stats.noMonthlyData")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
