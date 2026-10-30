# 💸 Expense Tracker (SplitWise Pro)

[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A production-ready, feature-rich shared expense tracker and debt simplification web application built with **Angular 18** (Standalone Components + reactive **Signals**). 

Split expenses with roommates, trip buddies, and project teams effortlessly. Supports multiple split algorithms, live balance calculations, automated debt minimization, budget tracking, analytics, and persistent storage.

---

## 🌟 Key Features

### 📊 Comprehensive Dashboard
- **Financial Summary Cards**: Real-time stats on total group spending, what you paid, what you owe, and what you are owed.
- **Visual Breakdown**: Interactive monthly spend bar charts and category distribution donut graphs.
- **Recent Activity Feed**: Real-time notifications and timeline of recently recorded expenses and settlements.

### 👥 Group & Member Management
- Create custom groups (e.g., Trips, Home, Project, Dining) with custom avatars and tags.
- Per-group budget tracker with visual progress bars and proactive threshold alerts (80%, 90%, 100%).
- Individual member profiles tracking total paid, share owed, received amounts, and net balances.

### 🧮 Advanced Split Calculation Engine
Record expenses flexibly with 4 distinct splitting methods:
- **Equal Split (`=`)**: Evenly divides the bill among selected participants with exact penny-rounding reconciliation.
- **Unequal Split (`≠`)**: Specify custom amounts per participant with real-time balance validation.
- **Percentage Split (`%`)**: Allocate percentage shares that dynamically compute currency values and ensure a 100% total.
- **Exact Split (`₹`)**: Directly enter custom fixed sums per participant.

### 🔄 Greedy Debt Simplification
- Automatically calculates net balances across all group participants.
- Uses a **Greedy Max-Debtor / Max-Creditor algorithm** to resolve circular debts into the minimum possible number of direct repayment transactions.
- Easily resolve settlements with one-click **"Mark as Paid"** workflow.

### 📈 Expense History & Analytics
- Search and filter expenses across groups, categories, members, or dates.
- High-level analytics: total spent, average expense size, top expense category, and per-group expenditure comparisons.

### 🎨 Polished UI & Theming
- **Dark & Light Mode**: Seamless theme switching persisted to user preferences.
- **Fully Responsive**: Collapsible sidebar navigation on desktop and an intuitive bottom tab bar navigation on mobile devices.
- **Toast Notifications & Modals**: Smooth micro-animations and zero-disruption confirmation flows.

### 💾 LocalStorage Persistence
- Fully client-side with automatic persistence to browser `localStorage`.
- Includes realistic seed mock data on first launch with an option to reset at any time in Settings.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Angular 18](https://angular.dev/) (Standalone Components, No NgModules) |
| **State Management** | Angular Signals (`signal`, `computed`, `effect`) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | Vanilla CSS + CSS Custom Properties (Theme tokens) + Bootstrap 5 utilities |
| **Icons** | [Lucide Angular](https://lucide.dev/) |
| **Storage** | Browser `localStorage` API |

---

## 🏗 Project Architecture

```text
src/app/
├── core/
│   ├── models/
│   │   └── models.ts             # Strong TypeScript interfaces & data contracts
│   ├── services/
│   │   ├── store.service.ts      # Reactive central state store powered by Signals
│   │   ├── local-storage.service.ts # Resilient browser storage wrapper
│   │   └── mock-data.ts          # Default seed dataset for quick evaluation
│   ├── styles/
│   │   └── variables.css         # CSS design tokens, themes & color palettes
│   └── utils/
│       ├── expense-utils.ts      # Share resolution & greedy debt simplification engine
│       ├── settlement-utils.ts   # Settlement helpers & status handlers
│       └── format-currency.ts   # Formatter utilities (INR / Currency)
├── layout/
│   ├── shell/                    # App root layout with responsive shell
│   ├── navbar/                   # Top navigation with theme switch & quick action
│   ├── sidebar/                  # Collapsible desktop sidebar
│   ├── mobile-navbar/            # Mobile bottom navigation bar
│   └── page-header/              # Reusable page title & actions banner
├── features/
│   ├── dashboard/                # Main financial overview & summary widgets
│   ├── groups/                   # Group list and group creation modal
│   ├── group-details/            # Balances, scoped expenses, and group budget
│   ├── expenses/                 # Expense list, filters, and dynamic split form
│   ├── settlements/              # Pending and completed debt repayments
│   ├── members/                  # Team and member balances
│   ├── analytics/                # Spending graphs & category breakdown
│   ├── settings/                 # App configurations, preferences & data reset
│   └── not-found/                # 404 fallback page
└── shared/
    ├── components/               # Button, Avatar, Badge, Modal, StatCard, ProgressBar, etc.
    └── pipes/                    # Currency formatting & relative time pipes
```

---

## 🧠 Debt Simplification Algorithm

When multiple expenses are shared within a group, debts can form complex cycles (e.g., A owes B, B owes C, C owes A). This application eliminates unnecessary intermediate transactions:

1. **Net Balance Calculation**: Compute net credit/debt for each member:
   $$\text{Balance}_i = \text{Total Paid}_i - \text{Total Share}_i$$
2. **Greedy Matching**:
   - Identify the largest debtor (most negative balance) and largest creditor (most positive balance).
   - Settle the minimum of the two amounts between them:
     $$\text{Settlement} = \min(|\text{Debtor Balance}|, \text{Creditor Balance})$$
   - Update balances and repeat until all debts reach zero.
3. **Result**: Minimizes the number of payments required to clear all balances completely.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.19.0 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9+ or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manish-51/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/` in your browser. The app will automatically reload if you change any source files.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The build artifacts will be stored in the `dist/` directory.

---

## 📱 Responsive Layouts

- **Desktop (1024px+)**: Sidebar navigation, multi-column analytics, and rich data tables.
- **Tablet (768px – 1023px)**: Responsive card grid layouts and streamlined dashboard cards.
- **Mobile (320px – 767px)**: Sticky bottom navigation bar, touch-friendly buttons, and responsive modal split sheets.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Manish**
- GitHub: [@Manish-51](https://github.com/Manish-51)