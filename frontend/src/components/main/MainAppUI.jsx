import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// ─────────────────────────────────────────────────────────────
// API helper
// ─────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatHeaderDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatFull(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────
// Heatmap helpers
// ─────────────────────────────────────────────────────────────
function buildHeatmapGrid(allCheckins) {
  const countPerDate = {};
  allCheckins.forEach((c) => {
    countPerDate[c.date] = (countPerDate[c.date] || 0) + 1;
  });

  const now = new Date();
  const todayDate = todayStr();
  const start = new Date(now);
  start.setDate(now.getDate() - 364);

  const padStart = (start.getDay() + 6) % 7;
  const weeks = [];
  let week = Array.from({ length: padStart }, () => ({ empty: true }));

  for (let i = 0; i < 365; i++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = countPerDate[dateStr] || 0;
    week.push({
      empty: false,
      date: dateStr,
      count,
      isToday: dateStr === todayDate,
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push({ empty: true });
    weeks.push(week);
  }
  return weeks;
}

function buildMonthLabels(weeks) {
  const labels = new Array(weeks.length).fill(null);
  const seen = new Set();
  weeks.forEach((week, wi) => {
    const first = week.find((c) => !c.empty);
    if (!first) return;
    const d = new Date(first.date + "T12:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      labels[wi] = d.toLocaleDateString("en-US", { month: "short" });
    }
  });
  return labels;
}

function heatColor(count) {
  if (count === 0) return "var(--heat-0)";
  if (count <= 2) return "var(--heat-1)";
  if (count <= 4) return "var(--heat-2)";
  if (count <= 6) return "var(--heat-3)";
  return "var(--heat-4)";
}

// ─────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────
const IconPlus = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M7 1v12M1 7h12" />
  </svg>
);

const IconCheck = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6l3 3 5-5" />
  </svg>
);

const IconArrowRight = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6h8M6 2l4 4-4 4" />
  </svg>
);

const IconTrash = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

const IconLeaf = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const IconWrench = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Add Habit Modal (no color picker)
// ─────────────────────────────────────────────────────────────
function AddHabitModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 18, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)" },
    );
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const created = await apiFetch("/habits/", {
        method: "POST",
        body: JSON.stringify({ ...form, color: "#4ade80" }),
      });
      onCreated(created);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function closeWithAnimation() {
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 14,
      scale: 0.97,
      duration: 0.18,
      ease: "power2.in",
      onComplete: onClose,
    });
  }

  return (
    <div className="modal-overlay" onClick={closeWithAnimation}>
      <div
        className="modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">New Habit</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              ref={inputRef}
              className="form-input"
              placeholder="e.g. Morning run, Read, Meditate…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description{" "}
              <span
                style={{
                  color: "var(--text-3)",
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </label>
            <textarea
              className="form-input"
              placeholder="Why does this habit matter to you?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeWithAnimation}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !form.name.trim()}
            >
              {submitting ? "Adding…" : "Add Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Heatmap Grid
// ─────────────────────────────────────────────────────────────
function HeatmapGrid({ weeks, monthLabels }) {
  return (
    <div className="heatmap-inner">
      <div className="heatmap-months">
        {monthLabels.map((label, wi) => (
          <div
            key={wi}
            className="heatmap-month-label"
            style={{ width: 16, minWidth: 16, marginRight: 3 }}
          >
            {label ?? ""}
          </div>
        ))}
      </div>
      <div className="heatmap-body">
        <div className="heatmap-day-labels">
          {DAY_LABELS.map((d, i) => (
            <div key={d} className="heatmap-day-label">
              {i % 2 !== 0 ? d : ""}
            </div>
          ))}
        </div>
        <div className="heatmap-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((cell, di) => {
                if (cell.empty)
                  return <div key={di} className="heatmap-cell empty-slot" />;
                return (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: heatColor(cell.count),
                      outline: cell.isToday
                        ? "1.5px solid #4ade8088"
                        : undefined,
                      outlineOffset: "1px",
                    }}
                    data-tooltip={`${formatFull(cell.date)}${cell.count ? `  ·  ${cell.count} habit${cell.count > 1 ? "s" : ""}` : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function MainAppUI() {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const headerRef = useRef(null);
  const todayRef = useRef(null);
  const statsRef = useRef(null);
  const heatmapRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────
  const refresh = useCallback(async () => {
    const [h, c] = await Promise.all([
      apiFetch("/habits/"),
      apiFetch("/checkins/"),
    ]);
    setHabits(h);
    setCheckins(c);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refresh]);

  // ── Entrance animation ─────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(headerRef.current, { y: -20, opacity: 0, duration: 0.45 })
      .from(todayRef.current, { y: 24, opacity: 0, duration: 0.5 }, "-=0.25")
      .from(statsRef.current, { y: 24, opacity: 0, duration: 0.5 }, "-=0.38")
      .from(heatmapRef.current, { y: 16, opacity: 0, duration: 0.45 }, "-=0.3");
  }, [loading]);

  // ── Stagger rows when habits list changes ──────────────────
  useEffect(() => {
    if (!habits.length) return;
    gsap.fromTo(
      ".task-row",
      { opacity: 0, x: -12 },
      {
        opacity: 1,
        x: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [habits.length]);

  // ── Derived state ──────────────────────────────────────────
  const today = todayStr();
  const todayCheckins = new Set(
    checkins.filter((c) => c.date === today).map((c) => c.habit),
  );
  const doneTodayCount = todayCheckins.size;
  const totalHabits = habits.length;

  const maxCurrentStreak = habits.reduce(
    (max, h) => Math.max(max, h.current_streak ?? 0),
    0,
  );

  const monthlyRate = (() => {
    if (!totalHabits) return 0;
    const possible = totalHabits * 30;
    const now = new Date();
    let done = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      done += checkins.filter((c) => c.date === ds).length;
    }
    return Math.round((done / possible) * 100);
  })();

  const heatmapWeeks = buildHeatmapGrid(checkins);
  const monthLabels = buildMonthLabels(heatmapWeeks);

  // ── Handlers ──────────────────────────────────────────────
  function handleHabitCreated(created) {
    setHabits((prev) => [
      ...prev,
      { ...created, current_streak: 0, longest_streak: 0 },
    ]);
    setShowForm(false);
    setTimeout(() => {
      const rows = document.querySelectorAll(".task-row");
      const last = rows[rows.length - 1];
      if (last)
        gsap.fromTo(
          last,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.35, ease: "back.out(1.4)" },
        );
    }, 30);
  }

  async function handleDeleteHabit(e, id) {
    e.stopPropagation();
    try {
      await apiFetch(`/habits/${id}/`, { method: "DELETE" });
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCheckins((prev) => prev.filter((c) => c.habit !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleDone(e, habitId) {
    e.stopPropagation();
    if (togglingId === habitId) return;
    setTogglingId(habitId);

    const btn = document.querySelector(`[data-habit-btn="${habitId}"]`);
    if (btn)
      gsap.fromTo(
        btn,
        { scale: 0.82 },
        { scale: 1, duration: 0.38, ease: "back.out(2.2)" },
      );

    try {
      if (todayCheckins.has(habitId)) {
        const existing = checkins.find(
          (c) => c.habit === habitId && c.date === today,
        );
        if (existing) {
          await apiFetch(`/checkins/${existing.id}/`, { method: "DELETE" });
          setCheckins((prev) => prev.filter((c) => c.id !== existing.id));
        }
      } else {
        const created = await apiFetch("/checkins/", {
          method: "POST",
          body: JSON.stringify({ habit: habitId, date: today }),
        });
        setCheckins((prev) => [...prev, created]);
      }
      const updated = await apiFetch(`/habits/${habitId}/`);
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        Loading your habits…
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header" ref={headerRef}>
        <div className="app-logo">
          <div className="app-logo-mark">
            <IconLeaf />
          </div>
          <span className="app-logo-name">Habits</span>
        </div>
        <span className="app-header-date">{formatHeaderDate()}</span>
        <button className="btn-add-habit" onClick={() => setShowForm(true)}>
          <IconPlus /> Add Habit
        </button>
      </header>

      {/* ── Body ── */}
      <div className="app-body">
        {/* ── Top grid: Tasks | Stats ── */}
        <div className="top-grid">
          {/* Today's Habits */}
          <div className="panel-card" ref={todayRef}>
            <div className="panel-header">
              <div>
                <span className="panel-title">Today's Habits</span>
                <span className="panel-title-sub">— {formatHeaderDate()}</span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-3)",
                  fontWeight: 500,
                }}
              >
                {doneTodayCount} / {totalHabits} done
              </span>
            </div>

            <div className="tasks-body">
              {habits.length === 0 ? (
                <div className="tasks-empty">
                  <div className="tasks-empty-icon">🌱</div>
                  <div className="tasks-empty-text">
                    No habits yet.
                    <br />
                    Click{" "}
                    <strong style={{ color: "var(--accent)" }}>
                      Add Habit
                    </strong>{" "}
                    to start tracking.
                  </div>
                </div>
              ) : (
                habits.map((habit, idx) => {
                  const isDone = todayCheckins.has(habit.id);
                  const isToggling = togglingId === habit.id;
                  const streak = habit.current_streak ?? 0;

                  return (
                    <div key={habit.id}>
                      <div className="task-row">
                        <button
                          className={`task-done-btn ${isDone ? "done" : ""}`}
                          data-habit-btn={habit.id}
                          onClick={(e) => handleToggleDone(e, habit.id)}
                          disabled={!!isToggling}
                          title={isDone ? "Undo" : "Mark as done"}
                        >
                          {isDone ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconArrowRight size={11} />
                          )}
                        </button>

                        <span className={`task-name ${isDone ? "done" : ""}`}>
                          {habit.name}
                          {habit.description && (
                            <span
                              style={{
                                fontSize: "11.5px",
                                color: "var(--text-3)",
                                marginLeft: "8px",
                                fontWeight: 400,
                              }}
                            >
                              {habit.description}
                            </span>
                          )}
                        </span>

                        {streak > 0 ? (
                          <span className="task-streak">🔥 {streak}d</span>
                        ) : (
                          <span className="task-streak dim">0d</span>
                        )}

                        <button
                          className="task-delete-btn"
                          onClick={(e) => handleDeleteHabit(e, habit.id)}
                          title="Delete habit"
                        >
                          <IconTrash />
                        </button>
                      </div>
                      {idx < habits.length - 1 && (
                        <div className="task-divider" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="panel-card" ref={statsRef}>
            <div className="panel-header">
              <span className="panel-title">Stats</span>
            </div>
            <div className="stats-body">
              <div className="streak-hero">
                <div className="streak-hero-icon">🔥</div>
                <div>
                  <div className="streak-hero-label">Best active streak</div>
                  <div className="streak-hero-value">
                    {maxCurrentStreak > 0 ? `${maxCurrentStreak} days` : "—"}
                  </div>
                  <div className="streak-hero-sub">
                    {maxCurrentStreak > 0
                      ? "Keep it going!"
                      : "Start a streak today"}
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
                  <div className="stat-label">Monthly rate</div>
                  <div
                    className={`stat-value ${monthlyRate >= 70 ? "accent" : ""}`}
                  >
                    {totalHabits ? `${monthlyRate}%` : "—"}
                  </div>
                  <div className="stat-sub">last 30 days</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">All-time total</div>
                  <div className="stat-value">{checkins.length}</div>
                  <div className="stat-sub">completions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Habits tracked</div>
                  <div className="stat-value">{totalHabits}</div>
                  <div className="stat-sub">active habits</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Heatmap full-width ── */}
        <div className="heatmap-section" ref={heatmapRef}>
          <div className="heatmap-card-header">
            <span className="heatmap-card-title">Activity Heatmap</span>
            <div className="dev-badge">
              <IconWrench /> Dev note: coming soon
            </div>
          </div>

          <div className="heatmap-content">
            <div className="heatmap-wrapper">
              <HeatmapGrid weeks={heatmapWeeks} monthLabels={monthLabels} />
            </div>
            <div className="heatmap-legend">
              <span className="heatmap-legend-label">Less</span>
              {[
                "var(--heat-0)",
                "var(--heat-1)",
                "var(--heat-2)",
                "var(--heat-3)",
                "var(--heat-4)",
              ].map((c, i) => (
                <div
                  key={i}
                  className="heatmap-legend-cell"
                  style={{ background: c }}
                />
              ))}
              <span className="heatmap-legend-label">More</span>
            </div>

            {/* Dev overlay */}
            <div className="heatmap-blur-overlay">
              <div className="heatmap-coming-soon-title">
                Heatmap — Coming Soon
              </div>
              <div className="heatmap-coming-soon-sub">
                The global heatmap requires backend aggregation across all
                habits per day. This feature will be live once the API endpoint
                is ready.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <AddHabitModal
          onClose={() => setShowForm(false)}
          onCreated={handleHabitCreated}
        />
      )}
    </div>
  );
}
