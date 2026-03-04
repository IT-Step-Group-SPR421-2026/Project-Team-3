import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { apiFetch } from "../../utils/api";
import {
  todayStr,
  getDateRange365,
  getDateRangeForYear,
  formatHeaderDate,
} from "../../utils/dateHelpers";
import { IconPlus } from "../icons/Icons";
import AppHeader from "../layout/AppHeader";
import LoadingSpinner from "../layout/LoadingSpinner";
import HabitList from "../habits/HabitList";
import AddHabitModal from "../habits/AddHabitModal";
import EditHabitModal from "../habits/EditHabitModal";
import StatsPanel from "../stats/StatsPanel";
import Heatmap from "../heatmap/Heatmap";
import "../shared/Panel.css";
import "./MainAppUI.css";

export default function MainAppUI() {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const headerRef = useRef(null);
  const todayRef = useRef(null);
  const statsRef = useRef(null);
  const heatmapRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────
  const refresh = useCallback(async () => {
    const { fromStr, toStr } = getDateRange365();

    try {
      const [h, c, hm, st] = await Promise.all([
        apiFetch("/habits/"),
        apiFetch("/checkins/"),
        apiFetch(`/heatmap/?from=${fromStr}&to=${toStr}`),
        apiFetch("/stats/"),
      ]);
      setHabits(h);
      setCheckins(c);
      setHeatmapData(hm);
      setStats(st);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(
        "Failed to load data. Please check your connection and try again.",
      );
    }
  }, []);

  const fetchHeatmapForYear = useCallback(async (yearOrLast365) => {
    setHeatmapLoading(true);
    try {
      let fromStr, toStr;
      if (yearOrLast365 === "last365") {
        ({ fromStr, toStr } = getDateRange365());
      } else {
        ({ fromStr, toStr } = getDateRangeForYear(yearOrLast365));
      }
      const hm = await apiFetch(`/heatmap/?from=${fromStr}&to=${toStr}`);
      setHeatmapData(hm);
    } catch (err) {
      console.error("Failed to fetch heatmap:", err);
    } finally {
      setHeatmapLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
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

  // ── Handlers ──────────────────────────────────────────────
  async function handleHabitCreated() {
    await refresh();
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
      await refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEditSaved() {
    setEditingHabit(null);
    await refresh();
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
        }
      } else {
        await apiFetch("/checkins/", {
          method: "POST",
          body: JSON.stringify({ habit: habitId, date: today }),
        });
      }
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner />;
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="app-shell">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button
            className="error-retry-btn"
            onClick={() => {
              setError(null);
              setLoading(true);
              refresh().finally(() => setLoading(false));
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  // ---
  // Render
  // ──────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div ref={headerRef}>
        <AppHeader />
      </div>

      <div className="app-body">
        {/* Top grid: Tasks | Stats */}
        <div className="top-grid">
          {/* Today's Habits */}
          <div className="panel-card" ref={todayRef}>
            <div className="panel-header">
              <div>
                <span className="panel-title">Today's Habits</span>
                <span className="panel-title-sub">— {formatHeaderDate()}</span>
              </div>
              <div className="panel-header-actions">
                <span className="panel-header-count">
                  {doneTodayCount} / {totalHabits} done
                </span>
                <button
                  className="btn-add-habit"
                  onClick={() => setShowForm(true)}
                >
                  <IconPlus size={12} /> Add Habit
                </button>
              </div>
            </div>

            <div className="tasks-body">
              <HabitList
                habits={habits}
                todayCheckins={todayCheckins}
                onToggleDone={handleToggleDone}
                onDelete={handleDeleteHabit}
                onEdit={setEditingHabit}
                togglingId={togglingId}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="panel-card" ref={statsRef}>
            <div className="panel-header">
              <span className="panel-title">Stats</span>
            </div>
            <StatsPanel
              maxCurrentStreak={maxCurrentStreak}
              doneTodayCount={doneTodayCount}
              totalHabits={totalHabits}
              stats={stats}
            />
          </div>
        </div>

        {/* Heatmap */}
        <div ref={heatmapRef}>
          <Heatmap
            heatmapData={heatmapData}
            onYearChange={fetchHeatmapForYear}
            loading={heatmapLoading}
          />
        </div>
      </div>

      {showForm && (
        <AddHabitModal
          onClose={() => setShowForm(false)}
          onCreated={handleHabitCreated}
        />
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
