// ─────────────────────────────────────────────────────────────
// API Configuration & Helper
// ─────────────────────────────────────────────────────────────
import { auth } from "../firebase";

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "https://project-team-3.onrender.com/api";

export async function apiFetch(path, opts = {}) {
  // Attach Firebase ID token if a user is signed in
  const authHeaders = {};
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
