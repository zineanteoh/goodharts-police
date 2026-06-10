# Submission Form

## Project Title *

Goodhart Police

## What Did You Build? *

> In 2-4 sentences, explain what it does, who it is for, and what judges should look at first.

Goodhart's law says, "When a measure becomes a target, it ceases to be a good measure."

As companies adopt AI, it gets harder for leaders to tell whether AI work is driving real business outcomes or just better-looking activity metrics, like high PR volume or flashy product demos with little impact.

Goodhart Police helps teams resist this by reviewing open PRs and nudging authors to add useful descriptions when they are missing. If a large PR lacks a clear hypothesis for why it matters, the agent asks the author to explain the expected impact.

More importantly, Goodhart Police periodically looks back at merged PRs, evaluates their outcomes using observability data, and highlights the work that appears most tied to business impact. It can connect to Slack or other apps to share those updates with the company.

## Links For Judges *

> Paste direct, judge-accessible links only. Judges must be able to open them without logging in, requesting access, installing anything, or asking you for help. Recommended: live demo link, repo/artifact link, and screenshot/video/final-output link if the demo is fragile. Put the most important links first.

https://github.com/zineanteoh/goodharts-police
https://raw.githubusercontent.com/zineanteoh/goodharts-police/main/public/goodhart-police-banner.png

## How Did You Use Codex? *

> Be specific: what did Codex help you build, debug, design, test, or improve? Codex usage is the biggest scoring category.

I used Codex as both a product thinking partner and an implementation agent. Before coding, I had Codex ask one product question at a time until the idea became sharper: not a generic dashboard, but a PR review agent that fights fake productivity. Codex then built the React/TypeScript/Vite app, seeded the demo data, wired a GitHub + Anthropic analysis endpoint, added `.env` handling, debugged API/model issues, simplified the UI copy, and pushed the final code to GitHub.

## Current Status *

> Tell judges what works now, what is partial, and what is broken. Short is fine. If you used starter code, templates, prior work, or existing assets, say what you built or meaningfully improved during the hackathon.

What works today: a React/TypeScript demo where you paste a GitHub repo URL, run a PR scan, and see standout PRs: quiet high-impact work, suspicious churn, and open PRs missing an impact hypothesis. There is also backend code for fetching GitHub PR metadata and calling Anthropic to generate the analysis.

What is partial: observability data is mocked, and the app has a seeded fallback docket so the demo still works if the live LLM/API path is flaky. The product behavior is real, but the business-impact evidence is demo data.

What I would build next: a one-click "Add Goodhart Police" setup for any repo, plus Slack integration so teams can choose a channel and receive periodic updates about merged PRs that appear to have meaningfully improved business outcomes.
