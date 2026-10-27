# TaskSwap

A maroon-and-beige workplace task-exchange prototype. Built with React, Vite, Express, and Lucide icons. Fonts are bundled locally.

## Run

Requires Node.js 22+ and npm. From `/workspace/new_project`:

```sh
npm ci --cache /tmp/taskswap-npm-cache
npm run dev
```

The server listens on port 3000 (override with `PORT`). For production, run `npm run build` then `npm start`. Both modes serve the API and frontend from the same origin.

## What works

- The home page explains the exchange and includes an interactive sample. Click **Open workspace** to browse tasks.
- On laptops, click **Pass / Interested**, press **← / →**, drag a card at least 60 pixels, or swipe horizontally on the card with a trackpad. Buttons and keyboard controls do not require dragging. One trackpad gesture makes at most one decision. Undo reverses the last decision in the current session.
- **Review passed tasks** brings back skipped tasks without clearing saved ones. Direct pages `/discover`, `/board`, and `/notes` survive refresh and support browser back/forward navigation.
- Search tasks, filter categories, inspect deliverables, constraints, and acceptance criteria.
- Post a task; save tasks; create and remove trade drafts.
- Write an autosaved project brief and review suggested tasks before posting them.
- Responsive layout, keyboard-accessible dialogs, reduced-motion support.

This is a **single-user local prototype**, not a shared workplace service. Sample coworkers are fictional. Tasks, decisions, briefs, and trades persist in browser local storage; trade drafts are never sent. Storage is not encrypted or synchronized. Only use nonconfidential demonstration data. Clearing browser storage removes it.

## Project notes and optional AI

Structured context includes the project goal, deliverable, timing, constraints/permissions, and definition of done. Without an AI key, the app explicitly labels suggestions as deterministic demo templates.

To enable live generation, set `TASKSWAP_AI_KEY` securely in the server environment (or an ignored `.env` file). Optional `TASKSWAP_AI_MODEL` defaults to `gpt-4.1-mini`. Restart the server after configuration. Keys never enter the browser bundle. The server sends the brief to `https://api.openai.com/v1/chat/completions` only on a generation request. Access to `api.openai.com` and an authorized API account are required. Live provider responses have not been verified in this environment because no key is configured. Provider errors remain errors; they are not silently presented as generated results.

AI suggestions are drafts. Confirm scope, effort, permissions, and any manager approval before exchanging work. Matching, real messaging, authentication, shared database storage, and multi-person trade loops are future features. Do not expose this prototype as a public multi-user service without authentication, authorization, rate limiting, and data-governance work.

## Validation

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite uses `/usr/bin/chromium` when available and starts its own development server when necessary. On your Mac or another computer, run `npx playwright install chromium` once before the browser suite. You can override the browser path with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Tests cover swipe/undo persistence, project-brief-to-post workflow, trade drafts, real pointer dragging, keyboard controls after button focus, horizontal wheel/trackpad events, short-drag cancellation, filter resets, API validation, landing navigation, laptop button visibility, mobile overflow, and modal dismissal. Trackpad behavior is validated with Chromium wheel events; physical Mac trackpads and Safari have not been tested here.

Each cloud task already has an isolated checkout. Use the existing repository; don't create a Git worktree unless explicitly requested.
