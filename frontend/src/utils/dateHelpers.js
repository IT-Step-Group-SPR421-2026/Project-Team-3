// ─────────────────────────────────────────────────────────────
// Date Helper Functions
// ─────────────────────────────────────────────────────────────

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatHeaderDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFull(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDateRange365() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 364);
  const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(from.getDate()).padStart(2, "0")}`;
  const toStr = todayStr();
  return { fromStr, toStr };
}
