# Repository map

This is an explicit map of the app, its checks, and its documentation. Generated `node_modules/` and `dist/` folders are ignored.

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Project rules and where code goes. |
| `README.md` | What this app is and how to install, run, and test it. |
| `HANDOFF.md` | Finished steps and current verification state for the runner. |
| `TASKS.md` | Two unfinished tasks assigned to Claude Code and Codex. |
| `PLANTED.md` | Named intentional diagnostic fixtures. |
| `docs/REPO-MAP.md` | This file map. |
| `.gitignore` | Local dependency and build exclusions. |
| `package.json` | Dependencies and npm scripts. |
| `package-lock.json` | Locked dependency versions. |
| `tsconfig.json` | TypeScript compiler settings. |
| `vite.config.ts` | Vite and Vitest configuration. |
| `index.html` | Single-page HTML entry point. |
| `public/favicon.svg` | Local app icon. |
| `config/demo.config.json` | Obviously fake API-key fixture for diagnostics. |
| `src/main.ts` | App startup, updates, and browser event listeners. |
| `src/render.ts` | Departure board and device panel markup. |
| `src/style.css` | Responsive layout, colors, and board-only Doto typography. |
| `src/clock.ts` | Station clock formatting with the known winter-time bug. |
| `src/device.ts` | Screen, appearance, time zone, and connection readings. |
| `src/timetable.ts` | Daily schedule selection and countdown calculations. |
| `src/data/timetable.ts` | Fictional daily station and departure sample data. |
| `tests/app.test.ts` | DOM integration checks for station selection, updates, storage, and browser signals. |
| `tests/clock.test.ts` | Clock formatting checks. |
| `tests/device.test.ts` | Device panel behavior checks. |
| `tests/timetable.test.ts` | Station, departure, delay, and rollover checks. |
| `tests/planted.test.ts` | The one deliberately failing diagnostic test. |
