# TripTab

TripTab is a lightweight INR trip expense splitter built with React, TypeScript, Vite, and Fluent UI.

## Current functionality

- Create trips with named participants.
- Add expenses paid by any participant.
- Split each expense equally, by custom shares, or by percentages.
- Keep every calculation in integer paise and distribute rounding remainders deterministically.
- Show participant balances, category totals, and the smallest set of settlement transfers.
- Persist trips in browser `localStorage` so the app works without a server.

## Development

```bash
npm install
npm run dev
```

The data access layer lives in `src/services/api.ts`. It currently uses browser storage and is isolated so it can be replaced with Django API calls without changing the calculation or presentation layers.
