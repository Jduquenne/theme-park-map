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

# Coding Standards

- **Zero/Minimal Comments**: The code must be self-documenting through clear, explicit naming conventions. Only comment on highly complex business logic or weird workarounds.
- **Typing**: Strict TypeScript. No `any`. Define proper interfaces for all JSON data structures.

# Git Workflow Rules

- **DO NOT execute `git commit` yourself.** The user manages their own commits.
- **MANDATORY REMINDER**: Whenever you complete a significant logical step, a feature, or a complex refactoring, explicitly write a message reminding the user to commit their changes before moving on to the next task.
