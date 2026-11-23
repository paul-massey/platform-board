# Platform Board

A small public test app for WorkOffline's Vibe Coding: a calm dot-matrix departure board, a station picker, next-train countdowns, and a This device panel showing screen size, light or dark appearance, time zone, and connection status.

Built with Vite and TypeScript. Departures are fictional sample timetable data checked into this repo, repeated daily, not live travel information. There is no back end and no real API key. The Doto board font is bundled locally.

Use Node.js 22.12 or later.

```sh
npm install
npm run dev
npm test
```

Open the local address printed by Vite. Create a production build with `npm run build`.

`npm test` intentionally exits with one failure named `PLANTED: diagnostic test intentionally fails`. All other tests should pass. See [PLANTED.md](PLANTED.md) for the diagnostic fixtures, [TASKS.md](TASKS.md) for the two unfinished agent tasks, and [docs/REPO-MAP.md](docs/REPO-MAP.md) for the file map.
