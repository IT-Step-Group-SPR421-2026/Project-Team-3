<div align="center">

<p align="center">
  <img src="frontend/src/assets/leaf.svg" width="120" alt="Leaf-icon">
</p>

# Habitflow

### _A GitHub-style contributions calendar for daily habits_

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django)](https://www.djangoproject.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCB2B?logo=firebase)](https://firebase.google.com/)

---

</div>

🚀 A GitHub-style contributions calendar for daily habits.

## ✨ Goals

- Create habits
- Mark daily check-ins
- See a heatmap calendar
- Track streaks
- View simple stats

## 🧰 Tech Stack

- Frontend: React (Vite)
- Backend: Django + Django REST Framework
- API: JSON only
- Auth (planned): Firebase Auth

## 📦 Project Structure

- backend/ — Django API
- frontend/ — React app

## 🧪 Local Dev (quick)

1. Start Django API
2. Start React dev server
3. Confirm API at http://127.0.0.1:8000/api/habits/

## 🗺️ 4-Week Development Plan

### Week 1 — Foundations

- Align on scope, user stories, and data model (Habit, CheckIn)
- Define API contracts (endpoints, payloads, response shapes)
- Set up base UI layout and design tokens
- Wire backend + frontend connection test
- Prepare development workflow (branching, PRs, code review)

### Week 2 — Core Features

- Habit creation form and list UI
- Daily check-in flow (create/check-in)
- Basic streak calculation in API response
- Heatmap data shape defined

### Week 3 — Visualization + Stats

- Heatmap calendar UI
- Streak display in UI
- Simple stats (total check-ins, best streak)
- Empty/edge state UX polish

### Week 4 — Auth + Polish

- Firebase Auth integration (email/password)
- Per-user data separation
- Basic loading/error states
- Final QA and cleanup

## 🔐 Auth Plan (Firebase)

We plan to add Firebase Auth for a simple, reliable login flow.
Target is Week 4 after core features are stable.

## ✅ Status

Ready for team development. The project is intentionally minimal to keep onboarding easy.
