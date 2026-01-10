# Reports Page Integration Guide

This folder contains a standalone Reports page for your trade journal that uses **plain CSS** (no Tailwind required).

## Files Included

```
integration-export/
├── ReportsPage.tsx    # Main component with all sub-components
├── Reports.css        # All styles (dark theme)
├── types.ts           # TypeScript interfaces
├── mockData.ts        # Sample data and helper functions
└── README.md          # This file
```

## Dependencies Required

Install these packages in your project:

```bash
npm install recharts react-router-dom
# or
yarn add recharts react-router-dom
```

## Integration Steps

### 1. Copy the files

Copy all files from this folder to your project, for example:
```
src/
├── pages/
│   └── ReportsPage.tsx
├── styles/
│   └── Reports.css
├── data/
│   ├── types.ts
│   └── mockData.ts
```

### 2. Update imports in ReportsPage.tsx

After moving files, update the import paths:

```tsx
// ReportsPage.tsx
import { FilterCategory, TradeData } from '../data/types';
import { filterCategories, getDataForCategory, getCategoryTitle } from '../data/mockData';
import '../styles/Reports.css';
```

### 3. Add to your router

```tsx
// App.tsx or your router file
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4. Add Inter font (optional but recommended)

Add to your `index.html` or main CSS file:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## Connecting to Your Real Data

Replace the mock data functions with your actual trade data:

```tsx
// In your data service or API layer
export async function fetchTradeData(category: FilterCategory): Promise<TradeData[]> {
  const response = await fetch(`/api/trades/reports?category=${category}`);
  return response.json();
}

// In ReportsPage.tsx
import { useEffect, useState } from 'react';

const ReportsPage = () => {
  const [data, setData] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTradeData(activeFilter)
      .then(setData)
      .finally(() => setLoading(false));
  }, [activeFilter]);

  // ... rest of component
};
```

## Customizing Colors

Edit the CSS variables in `Reports.css`:

```css
:root {
  --bg-primary: #0f1419;      /* Main background */
  --bg-card: #161b22;         /* Card background */
  --primary-color: #7c3aed;   /* Purple accent */
  --profit-color: #3fb950;    /* Green for profits */
  --loss-color: #f85149;      /* Red for losses */
}
```

## Features

- ✅ Filter tabs (Days, Weeks, Months, Time, Duration, etc.)
- ✅ Horizontal bar charts (Distribution & Performance)
- ✅ Summary table with win rate indicators
- ✅ Dropdown filters (Date range, Accounts, etc.)
- ✅ Responsive design
- ✅ Dark theme
- ✅ TypeScript support

## Questions?

The component is self-contained and should work in any React project with the listed dependencies.
