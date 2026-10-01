# Project Context

Interactive historical map viewer for theme parks using Angular, Tailwind CSS, and Leaflet (`L.CRS.Simple` for raster images). Local JSON files act as the static database.

# Angular Architecture & Best Practices

- **Standalone Only**: All components, directives, and pipes must be standalone. No NgModules.
- **Modern Control Flow**: Strictly use Angular 18+ control flow (`@if`, `@for`, `@defer`).
- **Reactivity**: Use Angular Signals (`signal`, `computed`, `effect`) for state management. Avoid NgRx for this MVP. Use RxJS only when bridging with APIs (`HttpClient`) or complex event streams.
- **Structure**: Follow a strict feature-based architecture:
  - `/src/app/core/`: Singleton services, guards, interceptors.
  - `/src/app/shared/`: Reusable UI components, interfaces, types.
  - `/src/app/features/`: Feature modules (e.g., `map-viewer`, `poi-legend`).
- **File Naming**: Kebab-case for files (`park-list.component.ts`).
- **Dev-Only Tooling**: This app is static and backend-less — any admin/editing tool (e.g. the POI editor) must never ship in the production bundle. Guarantee this at build time, not just behind a runtime guard: keep a `*.prod.ts` variant of the route config without the dev-only route, and swap it in via `fileReplacements` on the `production` build configuration in `angular.json` (see `src/app/app.routes.ts` / `app.routes.prod.ts`). Verify with `ng build --configuration production` that the dev feature's chunk is absent from `dist/`.

# Coding Standards

- **Zero/Minimal Comments**: The code must be self-documenting through clear, explicit naming conventions. Only comment on highly complex business logic or weird workarounds.
- **Typing**: Strict TypeScript. No `any`. Define proper interfaces for all JSON data structures.
- **Mobile-First Priority**: Active mobile adaptation must be implemented for all key features. Prioritize mobile-first patterns like Bottom Sheets and floating controls over merely hiding large desktop elements. Code responsive interaction behaviors (e.g., a drag gesture for the sheet) instead of simple toggling.

# Git Workflow Rules

- **DO NOT execute `git commit` yourself.** The user manages their own commits.
- **MANDATORY REMINDER**: Whenever you complete a significant logical step, a feature, or a complex refactoring, explicitly write a message reminding the user to commit their changes before moving on to the next task.
