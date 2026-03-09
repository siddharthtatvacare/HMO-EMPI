# HMO EMPI Dashboard — Project Setup

## Overview

Analytics dashboard for **Intellicare** (Philippine HMO) — an Enterprise Master Patient Index (EMPI) covering 1,000 patients across chronic disease management, risk stratification, financial intelligence, and operational metrics.

**Codename:** Project Malasakit

## Prerequisites

- **Node.js** >= 18 (developed on v25.2.1)
- **npm** >= 9 (developed on v11.6.2)

## Quick Start

```bash
cd dashboard
npm install
npm run dev
```

The dev server runs on `http://localhost:5174` by default (Vite).

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Build tool | Vite | 7.x |
| Charts | Chart.js + react-chartjs-2 | 4.x / 5.x |
| Styling | Pure CSS (no framework) | — |
| Linting | ESLint | 9.x |

### Dependencies (from `dashboard/package.json`)

**Runtime:**
- `react` ^19.2.4
- `react-dom` ^19.2.4
- `chart.js` ^4.5.1
- `react-chartjs-2` ^5.3.1

**Dev:**
- `vite` ^7.3.1
- `@vitejs/plugin-react` ^5.1.4
- `eslint` ^9.39.1 (with react-hooks and react-refresh plugins)

## Project Structure

```
HMO EMPI/
├── dashboard/                  # Main React application
│   ├── src/
│   │   ├── App.jsx            # Root — tab routing, patient detail view
│   │   ├── App.css            # All styles (single CSS file, CSS variables)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── ChartWrapper.jsx    # Chart.js wrapper with click handlers
│   │   │   ├── DataTable.jsx       # Sortable, searchable, paginated table
│   │   │   ├── DrillDownPanel.jsx  # Overlay panel for drill-down lists
│   │   │   ├── InfoButton.jsx
│   │   │   ├── KpiCard.jsx         # Metric cards with color coding
│   │   │   ├── Panel.jsx           # Section container
│   │   │   ├── RiskBadge.jsx       # Risk cohort color badge
│   │   │   └── SectionHeader.jsx
│   │   ├── data/
│   │   │   ├── generateData.js     # Seeded random data generation (seed=42)
│   │   │   ├── constants.js        # Risk cohorts, biomarker ranges, employers
│   │   │   ├── metrics.js          # Computed aggregations from generated data
│   │   │   └── store.js            # Data initialization and export
│   │   └── pages/
│   │       ├── PopulationRiskPage.jsx
│   │       ├── HealthOutcomesPage.jsx
│   │       ├── EcosystemRetentionPage.jsx
│   │       ├── FinancialIntelligencePage.jsx
│   │       ├── OperationsPage.jsx
│   │       ├── PatientRegistry.jsx
│   │       ├── PatientDetail.jsx         # Full patient 360 view
│   │       ├── CDMPage.jsx               # CDM program table (legacy tab)
│   │       ├── ConsultationsPage.jsx
│   │       ├── DiagnosticsPage.jsx
│   │       ├── PharmacyPage.jsx
│   │       └── ExecutiveSummary.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── Project Malasakit - Data Dashboard.xlsx   # Original requirements
├── implementation-plan.md
├── visualization-plan.md
└── CLAUDE.md                                 # This file
```

## Key Architecture Decisions

- **No backend / no database** — all data is generated client-side via seeded random (`seed=42`, deterministic). Every page load produces identical data.
- **Single CSS file** (`App.css`) using CSS custom properties for theming.
- **Currency:** Philippine Peso (₱). All financial figures use `toLocaleString()`.
- **CDM (Chronic Disease Management):** 530 of 1,000 patients are enrolled. Each has metabolic scores, BCA readings, diet/exercise plan adherence, and coaching engagement data. Improvers show significantly better adherence metrics than decliners.
- **Risk Cohorts:** Extremely Low → Low → At Risk → High → Extremely High, based on biomarker profiles (HbA1c, Lipid, Blood Glucose, Kidney, Liver).
- **Biomarker Trends:** CDM patients have Q0 (baseline) → Q1 → Q2; non-CDM patients have Q1 → Q2 only.

## Available Scripts

```bash
npm run dev      # Start dev server (HMR)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Data Generation Notes

`generateData.js` uses a seeded PRNG — adding or removing `seededRandom()` calls shifts all downstream values. If modifying data generation, verify that:
1. Risk cohort distribution remains pyramid-shaped (most patients low-risk)
2. CDM improvers show better adherence/engagement than decliners
3. Biomarker trends correlate with risk cohort and CDM status
