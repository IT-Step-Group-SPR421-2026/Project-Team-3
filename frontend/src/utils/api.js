// ─────────────────────────────────────────────────────────────
// API Configuration & Helper
// ─────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export async function apiFetch(path, opts = {}) {
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
