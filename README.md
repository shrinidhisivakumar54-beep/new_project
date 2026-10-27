# TaskSwap v1.3

A charcoal, cobalt, and white workplace task-exchange prototype. Built with React, Vite, Express, and Lucide icons. Fonts are bundled locally.

## Run

Requires Node.js 22+ and npm. From `/workspace/new_project`:

```sh
npm ci --cache /tmp/taskswap-npm-cache
npm run dev
```

The server listens on port 3000 (override with `PORT`). For production, run `npm run build` then `npm start`. Both modes serve the API and frontend from the same origin.

## The simple workflow

1. **Find tasks**: pass or save a task. Saving does not assign work.
2. **My swaps**: select a saved task, click **Propose swap**, and describe what you need in return. **Create demo swap** adds the proposal directly to Team board; **Save draft** keeps it for later.
3. **Team board**: the default **Who’s doing what** table shows each contributor, task, owner, and status. Open a swap to confirm agreement and both deliveries. **Swap status** is an optional board view.

**Project notes** are optional; use them only when you need help breaking down a larger project.

The header and sidebar show **Demo v1.3**. If that label or Team board is missing, you are running an older project folder. Stop the old terminal with Control+C, open this folder in VS Code, and start a new terminal. To avoid connecting to another old server, run `PORT=3001 npm run dev` and open port 3001 in your local browser. The terminal prints the project folder when it starts.

If every task is already saved, the empty deck links to your saved tasks. **Replay demo tasks** opens the sample reset controls without silently clearing your work.

## What works

- The home page explains the exchange and includes an interactive sample. Click **Open workspace** to browse tasks.
- On laptops, click **Pass / Interested**, press **← / →**, drag a card at least 60 pixels, or swipe horizontally on the card with a trackpad. Buttons and keyboard controls do not require dragging. One trackpad gesture makes at most one decision. Undo reverses the last decision in the current session.
- **Review passed tasks** brings back skipped tasks without clearing saved ones. Direct pages `/discover`, `/board`, and `/notes` survive refresh and support browser back/forward navigation.
- Search tasks, filter categories, inspect deliverables, constraints, and acceptance criteria.
- Explore **20 sample tasks** from **8 fictional teammates** across design, writing, data, and reviews.
- Post a task; save tasks; create and remove trade drafts.
- Add a draft to **Team board** to simulate a two-sided exchange. See both task owners, both contributors, timing, and status in Proposed / In progress / Done columns.
- The default **Who’s doing what** table shows individual responsibilities. Filter by teammate, search, or show only your own work. **Swap status** is the optional Proposed / In progress / Done board.
- Start an exchange after confirming simulated agreement. Mark both deliveries ready before completing it; activity and status persist locally.
- Open **Demo controls** to replay the sample deck or restore the six sample exchanges. Deck replay clears only decisions on sample task IDs, including saved samples. Sample-board restore replaces only sample exchanges. Your posted tasks, notes, drafts, and custom exchanges are retained.
- Write an autosaved project brief and review suggested tasks before posting them.
- Responsive layout, keyboard-accessible dialogs, reduced-motion support.

This is a **single-user local prototype**, not a shared workplace service. Sample coworkers are fictional. Tasks, decisions, briefs, and trades persist in browser local storage; trade drafts and simulated exchange updates are never sent. The team board is an illustrative local demo, not a connected team service. Storage is not encrypted or synchronized. Only use nonconfidential demonstration data. Clearing browser storage removes it.

## Suggested presentation (3–5 minutes)

1. Open the home page and explain the example exchange.
2. Open the workspace. Pass a task, save another, and undo a swipe. The deck includes 20 sample tasks.
3. In **My swaps → Saved tasks**, click **Propose swap**, describe the help you need in return, set timing, and click **Create demo swap**. Saving a draft is optional.
4. Confirm simulated agreement and start the exchange. Show both sides on **Team board**.
5. Mark both deliveries ready, then complete the exchange. The default table shows the person working, task, task owner, and status. **Swap status** opens the optional three-column board.
6. Use **Demo controls** to replay the examples for another audience. Resets are limited to the sample content described in the dialog.

Direct routes: `/discover`, `/board`, `/team`, `/notes`. Every person except the local demo profile is fictional. Do not describe simulated confirmations as real teammate approval.

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

The browser suite uses `/usr/bin/chromium` when available and starts its own development server when necessary. On your Mac or another computer, run `npx playwright install chromium` once before the browser suite. You can override the browser path with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Tests cover swipe/undo persistence, project-brief-to-post workflow, trade drafts, real pointer dragging, keyboard controls after button focus, horizontal wheel/trackpad events, short-drag cancellation, filter resets, API validation, landing navigation, laptop button visibility, mobile overflow, modal dismissal, exchange state transitions, two-sided draft conversion, team filters, and preservation of user work during sample resets. Trackpad behavior is validated with Chromium wheel events; physical Mac trackpads and Safari have not been tested here.

Each cloud task already has an isolated checkout. Use the existing repository; don't create a Git worktree unless explicitly requested.
