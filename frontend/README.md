# StudentHub - Campus Companion

A student productivity dashboard built with React and Tailwind CSS. Track expenses, CGPA, attendance, daily work targets, and manage todos — all in one place.

## Features

- **Expense Tracker** — Log daily expenses with custom categories, view daily/monthly breakdowns with pie charts
- **CGPA Tracker** — Record semester grades and visualize your SGPA trend over time
- **Attendance Manager** — Set up your weekly schedule, mark attendance, and track subject-wise percentages
- **Daily Work Targets** — Set time-based, amount-based, or simple completion goals for each day
- **Todo List** — Organize tasks into custom categories with due dates and time tracking

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts (for data visualization)
- React Router DOM
- date-fns
- Lucide React (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

The app runs on `http://localhost:8080` by default.

## Data Storage

All data is stored in `localStorage` — no backend needed. Your data stays on your device.