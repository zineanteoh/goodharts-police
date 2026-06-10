# Goodhart Law Police

<img src="https://github.com/user-attachments/assets/f698157b-f59e-401e-b0b6-60d721bed438" width="800" />

> "When a measure becomes a target, it ceases to be a good measure."

Goodhart Police is a PR review agent for teams adopting AI-assisted engineering. It helps catch when engineering work looks productive by surface metrics, like PR volume or lines changed, but lacks a clear connection to business impact.

## What It Does

- Takes a GitHub repo URL.
- Scans open and merged PRs.
- Flags open PRs that are missing an impact hypothesis.
- Highlights merged PRs that appear high-impact, suspicious, or under-specified.
- Compares PR activity against business-impact style evidence.
- Uses observability-style signals to show what happened after merge.

## Demo Status

What works:

- React/TypeScript/Vite demo app.
- Repo input and PR scan flow.
- Seeded impact docket with standout PRs.
- Mock observability signals.
- Open PR comment draft asking authors to explain expected business outcome and measurement.
- Backend route for GitHub + Anthropic analysis.

What is partial:

- Observability data is mocked.
- Live Anthropic analysis is wired, but the demo has a seeded fallback because the LLM path can be flaky in local environments.
- The business-impact evidence is demo data, not production telemetry.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Anthropic key to `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Then open:

```text
http://127.0.0.1:4317
```

## Why This Exists

As companies adopt AI, it gets easier to reward fake productivity: more PRs, more code churn, more impressive demos. Goodhart Police pushes teams to ask a better question:

Did this work actually improve something customers or the business care about?

## Built With Codex

Codex helped shape the product direction, turn the idea into a demo flow, build the React/TypeScript app, seed the PR evidence, wire the GitHub + Anthropic backend, debug API/model issues, simplify the UI copy, and push the project to GitHub.
