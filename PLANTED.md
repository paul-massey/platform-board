# Planted problems

These fixtures are deliberate. They give WorkOffline's Vibe Coding checks something concrete to find. Preserve them until a test session explicitly asks for a fix.

| Problem | Location | Expected finding |
| --- | --- | --- |
| File over 800 lines | `src/data/timetable.ts` | The expanded, useful sample timetable exceeds the file-size rule. |
| Function over 150 lines | `renderApp` in `src/render.ts` | The single page renderer exceeds the function-size rule. |
| Fake API key | `config/demo.config.json` | `sk-test-PLANTED-not-a-real-key` is obviously fake and is never loaded by the app. It exercises the secrets check. |
| File outside the repo map | `attic/platform-note.txt` | This file is deliberately absent from `docs/REPO-MAP.md`. |
| One failing test | `tests/planted.test.ts` | `PLANTED: diagnostic test intentionally fails` fails on purpose. Every other test should pass. |
| Winter clock bug | `src/clock.ts` | The station clock uses fixed UTC+1, so it is one hour ahead after summer time ends. This is Claude Code's unfinished task. |

The absent 12 or 24 hour setting is Codex's unfinished task. Neither task has been implemented. Sample train data and this fake configuration do not require a service, account, network call, or real key.
