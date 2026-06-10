# Goodhart Police

<img src="https://github.com/user-attachments/assets/54d68769-ff2a-46cf-8dc8-cfa71e72fb74" width="800" />

> "When a measure becomes a target, it ceases to be a good measure."

Goodhart Police is a PR review agent for teams adopting AI-assisted engineering. It helps catch when engineering work looks productive by surface metrics, like PR volume or lines changed, but lacks a clear connection to business impact.

## Why

As companies adopt AI, it gets easier to reward fake productivity: more PRs, more code churn, more impressive demos. Goodhart Police pushes teams to ask a better question:

Did this work actually improve something customers or the business care about?

## What It Does

- Takes a GitHub repo URL.
- Scans open and merged PRs.
- Flags open PRs that are missing an impact hypothesis.
- Highlights merged PRs that appear high-impact, suspicious, or under-specified.
- Compares PR activity against business-impact style evidence.
- Uses observability-style signals to show what happened after merge.

## Demo

<img src="https://github.com/user-attachments/assets/0ed5c4e8-037e-4f5f-ac17-dee5d2f6d65f" width="800" />

## Built With Codex

This was coded up from zero in just one hour! Don't expect this to work end-to-end, but this provides a good scaffolding for companies seeking to actually drive high impact with AI, rather than suffer from Goodhart's law.

Codex helped shape the product direction, turn the idea into a demo flow, build the React/TypeScript app, seed the PR evidence, wire the GitHub + Anthropic backend, debug API/model issues, simplify the UI copy, and push the project to GitHub.
