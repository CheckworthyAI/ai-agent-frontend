
# ai-agent-frontend
**Checkworthy AI – Monitoring Dashboard**

This is the web dashboard for Checkworthy AI. It gives you a clean, simple way to watch, audit, and trust your LLM agents.
It’s plug-and-play: no learning curve, no busywork, just insights and action.

**What's in it**

* Live stats and instant activity logs
* Run GPT-powered audits right from the dashboard
* Compare any two agents head-to-head
* Works with your FastAPI backend (or any compatible API)

**Getting started**

1. Clone the repo

   ```
   git clone <repo-url>
   cd <repo-folder>
   ```
2. Install dependencies

   ```
   npm install
   ```
3. Set up your backend
   This dashboard expects a compatible FastAPI backend. By default, it talks to

   ```
   https://fastapi-monitoring.fly.dev
   ```

   To change the backend, update the `BASE_URL` in `App.js`.
4. Start the app

   ```
   npm start
   ```

   It should open up at `http://localhost:3000` by default.

**Features**

* **Landing page** to introduce your AI and brand
* **Live Dashboard** to monitor logs, metrics, and agent performance
* **Log submission** — add new agent logs for monitoring
* **Audit reports** — select any agent and generate a GPT-powered audit
* **A/B test UI** — compare two agents’ responses instantly
* **Everything auto-refreshes** (so you don’t have to!)

**Config options**

* To use your own backend, change the `BASE_URL` at the top of `App.js`.
* You can customize the logo by replacing `src/assets/CheckworthyAILogo.png`.

**Tech stack**

* React (with hooks)
* Vanilla CSS-in-JS for styling (easily customizable)
* No Redux, no heavy frameworks — just React


