import { useEffect } from "react";
import { gsap } from "gsap";
import { IconCheck, IconArrowRight, IconTrash, IconEdit } from "../icons/Icons";
import "./HabitList.css";

export default function HabitList({
  habits,
  todayCheckins,
  onToggleDone,
  onDelete,
  onEdit,
  togglingId,
}) {
  // Stagger animation when habits list changes
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

  if (habits.length === 0) {
    return (
      <div className="tasks-empty">
        <div className="tasks-empty-icon">🌱</div>
        <div className="tasks-empty-text">
          No habits yet.
          <br />
          Click <strong className="accent">Add Habit</strong> to start tracking.
        </div>
      </div>
    );
  }

  return (
    <>
      {habits.map((habit, idx) => {
        const isDone = todayCheckins.has(habit.id);
        const isToggling = togglingId === habit.id;
        const streak = habit.current_streak ?? 0;

        return (
          <div key={habit.id}>
            <div className="task-row">
              <button
                className={`task-done-btn ${isDone ? "done" : ""}`}
                data-habit-btn={habit.id}
                onClick={(e) => onToggleDone(e, habit.id)}
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
                  <span className="task-description">{habit.description}</span>
                )}
              </span>

              {streak > 0 ? (
                <span className="task-streak">🔥 {streak}d</span>
              ) : (
                <span className="task-streak dim">0d</span>
              )}

              <button
                className="task-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(habit);
                }}
                title="Edit habit"
              >
                <IconEdit />
              </button>

              <button
                className="task-delete-btn"
                onClick={(e) => onDelete(e, habit.id)}
                title="Delete habit"
              >
                <IconTrash />
              </button>
            </div>
            {idx < habits.length - 1 && <div className="task-divider" />}
          </div>
        );
      })}
    </>
  );
}
