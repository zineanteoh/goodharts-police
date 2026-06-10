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



## How Did You Use Codex? *

> Be specific: what did Codex help you build, debug, design, test, or improve? Codex usage is the biggest scoring category.

I used Codex as both a product thinking partner and an implementation agent. Before coding, I had Codex brainstorm ideas, then ask one product question at a time so the goal was clear in-context before it built. The biggest lesson: my first build attempt went in the wrong direction because the problem was under-specified, so I prompted Codex to ask better questions before generating code. After that, Codex built the app flow and spawned subagents to fix smaller issues.

## Current Status *

> Tell judges what works now, what is partial, and what is broken. Short is fine. If you used starter code, templates, prior work, or existing assets, say what you built or meaningfully improved during the hackathon.

What works today: an end-to-end flow that takes a GitHub repository URL, pulls open and merged PRs, reviews PR descriptions, and evaluates merged PR impact using observability-style signals.

What is partial: observability data is mocked, because wiring up real production metrics was out of scope for the hackathon.

What I would build next: a one-click "Add Goodhart Police" setup for any repo, plus Slack integration so teams can choose a channel and receive periodic updates about merged PRs that appear to have meaningfully improved business outcomes.