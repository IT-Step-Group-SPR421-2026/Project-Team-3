import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { apiFetch } from "../../utils/api";
import "./AddHabitModal.css";

export default function AddHabitModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      // Backend assigns color automatically based on number of habits
      await apiFetch("/habits/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated();
    } catch (err) {
      const errorMessage = err.message || "Failed to add habit";
      // Check if it's a subscription limit error
      if (
        errorMessage.includes("Free tier limited") ||
        errorMessage.includes("habit limit")
      ) {
        setError({
          message: errorMessage,
          isLimitError: true,
        });
      } else {
        setError({
          message: errorMessage,
          isLimitError: false,
        });
      }
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
          {error && (
            <div className={`form-error ${error.isLimitError ? "has-action" : ""}`}>
              <div className="error-message">{error.message}</div>
              {error.isLimitError && (
                <button
                  type="button"
                  className="error-action-link"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Navigate to upgrade");
                  }}
                >
                  Upgrade to Premium →
                </button>
              )}
            </div>
          )}

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
              <span className="form-label-optional">(optional)</span>
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
