# Platform Board rules

Every handoff starts with: read AGENTS.md, then HANDOFF.md.

## Rules

- Keep this a single-page Vite and TypeScript app with no back end or real keys.
- New code goes in the folders named below. Keep docs/REPO-MAP.md current.
- No file over 800 lines and no function over 150 lines.
- No secrets in the code. Keep the known fake fixture in config/demo.config.json.
- Use Doto for the departure board only. Keep the rest calm and readable.
- Do not use em dashes in app text or documentation.
- Run npm test and npm run build after code changes. Report the expected planted failure.
- Preserve the named fixtures in PLANTED.md and leave TASKS.md tasks for their assigned agents.

## Where code goes

- src/: app code and styles; src/data/: checked-in sample timetable.
- tests/: Vitest tests; public/: static assets; config/: test configuration fixtures.
- docs/: repository documentation. Root Markdown files describe this project and its work.
