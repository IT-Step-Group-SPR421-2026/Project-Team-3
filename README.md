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

🚀 A GitHub-style contributions calendar for daily habits with streaks, heatmap, stats, and XP.

## ✨ Core Features

- Habit CRUD + daily check-ins
- Heatmap calendar (per-day counts + color)
- Streaks (current + longest)
- Stats (weekly + monthly buckets)
- XP + ranks
- Global leaderboard
- Firebase Auth (Google sign-in)
- Premium subscription check (blockchain verification)

## 🧰 Tech Stack

- Frontend: React (Vite)
- Backend: Django + Django REST Framework
- API: JSON only
- Auth: Firebase Auth
- Web3: Hardhat + Sepolia contract

## 📦 Project Structure

- backend/ — Django API
- frontend/ — React app
- hardhat/ — smart contract + deployment artifacts

## 🧪 Local Dev (quick)

1. Start Django API
2. Start React dev server
3. Confirm API at http://127.0.0.1:8000/api/habits/

## 🔌 API Summary

- /api/habits/ (CRUD)
- /api/checkins/ (GET/POST/DELETE)
- /api/heatmap/?from=YYYY-MM-DD&to=YYYY-MM-DD
- /api/stats/ (global) or /api/stats/?habit_id=
- /api/xp/
- /api/leaderboard/
- /api/subscriptions/ (status, register, info)

## 🔐 Auth

- Firebase Auth is integrated.
- Backend uses Firebase ID tokens via `Authorization: Bearer <token>`.

## ✅ Status

Ready for team development and staging deployment. Set production env vars before AWS deploy.
