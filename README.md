# Campus Coin Log

A lightweight, fully functional student productivity dashboard built with React and Tailwind CSS. Track expenses, monitor your CGPA, manage attendance, set daily work targets, and organize todos — all in one place.

## Features

- **Expense Tracker** — Log daily expenses with custom categories, view daily/monthly breakdowns with pie charts.
- **CGPA Tracker** — Record semester grades and visualize your SGPA trend over time.
- **Attendance Manager** — Set up your weekly schedule, mark attendance, and track subject-wise percentages.
- **Daily Work Targets** — Set time-based, amount-based, or simple completion goals for each day.
- **Todo List** — Organize tasks into custom categories with due dates and time tracking.

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS (Vanilla JSX/JavaScript components without heavy UI libraries)
- **Routing:** React Router DOM
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Date Management:** date-fns
- **State Management:** React Context / Local Storage (No backend required)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd campus-coin-log
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The application will run locally, typically accessible at `http://localhost:5173` (or the port specified by Vite).

## Data Storage

All data is stored locally in your browser using `localStorage`. No backend is required, and your data stays entirely on your device for complete privacy and instant access.