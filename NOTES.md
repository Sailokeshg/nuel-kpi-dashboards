# NOTES

## Major Decisions & Trade-offs
- **Monorepo (npm workspaces)**: Makes it easy to run dev for both server and client together and to ship a single production server that serves static assets.
- **JS on server, TS on client**: Keeps server minimal while still giving strong types on the UI.
- **In-memory DB**: Keeps the mock API simple. Mutations update the same in-memory array so changes persist until server restarts.
- **Status server-side vs client-side**: Status is computed on the server to support filtering by status in GraphQL directly. Also computed on the client for UI rendering parity.
- **KPI trend generation**: Deterministic (seeded by product IDs) pseudo-randomization to create plausible daily Stock vs Demand curves for 7/14/30 ranges.
- **Transfer stock**: Because the sample schema has a single `warehouse` per product row, `transferStock` moves quantity from the product's current warehouse to a *target* warehouse. If a same-SKU product does not exist at the target, it's created. This is sufficient to show the UX and mutation wiring for transfers without modeling multi-location inventory tables.
- **Pagination**: Implemented via query variables `offset` and `limit` with total count for page controls.

## Error & Loading States
- Each query and mutation shows sensible spinners and error messages (toasts or inline banners).
- Empty states are handled for 0 search results.

## What I'd Improve With More Time
- **Unit/integration tests** using Vitest/RTL for components, and Apollo mocks for data layer.
- **Data modelling** for per-warehouse inventory lines (separate entity) + proper transfer validations/reservations.
- **Accessibility** enhancements: Focus traps and keyboard interactions in the drawer are set up, but additional a11y passes would be valuable.
- **Design polish**: More nuanced spacing and hover/pressed states for table rows and controls. Skeleton loaders.
- **Server persistence**: Move mock DB to a tiny file-based JSON store for persistence across restarts.
- **CI**: Add GitHub Actions workflow for typecheck, lint, build.
