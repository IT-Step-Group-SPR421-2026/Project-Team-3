import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatFull, todayStr } from "../../utils/dateHelpers";
import { getDateLocale } from "../../utils/locale";
import "./Heatmap.css";

// Monday = 0, Sunday = 6 (GitHub style)
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

// Cell size + gap constants — single source of truth used by both JS and CSS
const CELL = 14; // px
const GAP = 4; // px

function getHeatColor(count) {
  if (!count) return "var(--heat-0)";
  if (count <= 2) return "var(--heat-1)";
  if (count <= 4) return "var(--heat-2)";
  if (count <= 7) return "var(--heat-3)";
  return "var(--heat-4)";
}

// ─────────────────────────────────────────────────────────────
// Heatmap Grid Builders
// ─────────────────────────────────────────────────────────────
function buildHeatmapGrid(heatmapData) {
  const dataByDate = {};
  (heatmapData || []).forEach((d) => {
    dataByDate[d.date] = d;
  });

  const now = new Date();
  const todayDate = todayStr();

  // Start from 364 days ago (365 days total including today)
  const start = new Date(now);
  start.setDate(now.getDate() - 364);

  const weeks = [];
  let currentWeek = [];

  // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const startDayOfWeek = start.getDay();
  // Convert to Monday-first: 0=Monday, 6=Sunday
  const startDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Pad the first week with empty cells before the start date
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ empty: true });
  }

  // Build grid for 365 days
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(start.getTime());
    currentDate.setDate(currentDate.getDate() + i);

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    const dayData = dataByDate[dateStr];
    const count = dayData ? dayData.count : 0;

    currentWeek.push({
      empty: false,
      date: dateStr,
      count,
      isToday: dateStr === todayDate,
    });

    // If we've completed a week (7 days), push it and start new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad and push the last partial week if it exists
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ empty: true });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

// Returns [{ label, startWeek, span }] so each label can be centered over
// exactly the weeks that belong to that month.
function buildMonthLabels(weeks, locale) {
  // Find the start week index for each month
  const monthMap = new Map(); // "YYYY-MM" -> startWeekIndex

  weeks.forEach((week, wi) => {
    week.forEach((cell) => {
      if (cell.empty) return;
      const d = new Date(cell.date + "T12:00:00");
      if (d.getDate() === 1) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!monthMap.has(key)) monthMap.set(key, wi);
      }
    });
  });

  // Sort by weekIndex and compute spans
  const entries = [...monthMap.entries()]
    .map(([key, startWeek]) => {
      const [year, month] = key.split("-").map(Number);
      const label = new Date(year, month, 1).toLocaleDateString(locale, {
        month: "short",
      });
      return { label, startWeek };
    })
    .sort((a, b) => a.startWeek - b.startWeek);

  // Span = next month's startWeek - this month's startWeek (last month gets remaining weeks)
  return entries.map((entry, i) => ({
    label: entry.label,
    startWeek: entry.startWeek,
    span:
      i + 1 < entries.length
        ? entries[i + 1].startWeek - entry.startWeek
        : weeks.length - entry.startWeek,
  }));
}

// ─────────────────────────────────────────────────────────────
// Heatmap Component
// ─────────────────────────────────────────────────────────────
export default function Heatmap({ heatmapData, onYearChange, loading }) {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState("last365");
  const locale = getDateLocale(i18n.resolvedLanguage);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  // Only show current year since project just started
  const availableYears = [currentYear];

  const heatmapWeeks = buildHeatmapGrid(heatmapData);
  const monthLabels = buildMonthLabels(heatmapWeeks, locale);

  // Check if we have any actual data
  const hasData = heatmapData && heatmapData.length > 0;

  return (
    <div className="heatmap-section">
      <div className="heatmap-card-header">
        <span className="heatmap-card-title">{t("heatmap.title")}</span>
        <div className="heatmap-year-selector">
          <button
            className={`year-btn ${selectedYear === "last365" ? "active" : ""}`}
            onClick={() => handleYearChange("last365")}
            disabled={loading}
          >
            {t("heatmap.last365")}
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              className={`year-btn ${selectedYear === year ? "active" : ""}`}
              onClick={() => handleYearChange(year)}
              disabled={loading}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="heatmap-content">
        {loading ? (
          <div className="heatmap-loading">
            <div className="heatmap-spinner"></div>
            <div className="heatmap-loading-text">{t("heatmap.loading")}</div>
          </div>
        ) : !hasData ? (
          <div className="heatmap-empty">
            <div className="heatmap-empty-icon">📊</div>
            <div className="heatmap-empty-text">{t("heatmap.empty")}</div>
          </div>
        ) : (
          <>
            <div className="heatmap-wrapper">
              <div className="heatmap-inner">
                {/*
              Column-based layout:
              [day-label col] [weeks-area: month row on top, week columns below]
              This ensures month labels are always pixel-perfect above their columns.
            */}
                <div className="heatmap-grid-wrap">
                  {/* Day labels column */}
                  <div className="heatmap-day-col">
                    {DAY_LABELS.map((label, i) => (
                      <div key={i} className="heatmap-day-label">
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Weeks area */}
                  <div className="heatmap-weeks-area">
                    {/* Month label row — each label spans its exact month width, centered */}
                    <div className="heatmap-months-row">
                      {monthLabels.map(({ label, startWeek, span }, i) => {
                        // Width of `span` columns including their inter-column gaps
                        const width = span * CELL + (span - 1) * GAP;
                        // Left offset from the start of the weeks-cols area
                        const left = startWeek * (CELL + GAP);
                        return (
                          <div
                            key={i}
                            className="heatmap-month-slot"
                            style={{ width, left }}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Week columns */}
                    <div className="heatmap-weeks-cols">
                      {heatmapWeeks.map((week, wi) => (
                        <div key={wi} className="heatmap-week-col">
                          {week.map((cell, di) =>
                            cell.empty ? (
                              <div
                                key={di}
                                className="heatmap-cell heatmap-cell-empty"
                              />
                            ) : (
                              <div
                                key={di}
                                className="heatmap-cell"
                                style={{
                                  backgroundColor: getHeatColor(cell.count),
                                  outline: cell.isToday
                                    ? "1.5px solid #4ade8088"
                                    : undefined,
                                  outlineOffset: "1px",
                                }}
                                data-tooltip={
                                  cell.count
                                    ? t("heatmap.tooltip", {
                                        date: formatFull(cell.date, locale),
                                        count: cell.count,
                                      })
                                    : formatFull(cell.date, locale)
                                }
                              />
                            ),
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="heatmap-legend">
              <span className="heatmap-legend-label">{t("heatmap.less")}</span>
              {[
                "var(--heat-0)",
                "var(--heat-1)",
                "var(--heat-2)",
                "var(--heat-3)",
                "var(--heat-4)",
              ].map((c, i) => {
                const tooltips = ["0", "1-2", "3-4", "5-7", "8+"];
                return (
                  <div
                    key={i}
                    className="heatmap-legend-cell"
                    style={{ background: c }}
                    title={t("heatmap.legend", { label: tooltips[i] })}
                  />
                );
              })}
              <span className="heatmap-legend-label">{t("heatmap.more")}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
