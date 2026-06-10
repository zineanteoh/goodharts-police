import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const dataDir = path.resolve(__dirname, "data");
const feedbackFile = path.join(dataDir, "scope-feedback.json");
const docketFile = path.join(dataDir, "impact-docket.json");
const generatedDocketFile = path.join(dataDir, "generated-impact-docket.json");

const seed = {
  updatedAt: null,
  projectName: "Goodhart Guard",
  version: "v0.3-interview",
  thesis:
    "As enterprises adopt AI agents, the question shifts from 'how much work did the agent do?' to 'did the work improve the business outcome without creating perverse incentives?'",
  audience: "Eliza-style enterprise AI adoption teams and their clients",
  scope: {
    in: [
      "Detect when easy-to-count AI workflow metrics stop matching real impact.",
      "Compare activity metrics against outcome, quality, risk, and user-trust signals.",
      "Surface anti-gaming alerts with human-readable evidence.",
      "Produce an executive-ready confidence score for agent rollout governance.",
    ],
    out: [
      "Replacing enterprise analytics systems.",
      "Guaranteeing causality from weak data.",
      "Policing individual employees.",
      "Building a full SIEM, observability suite, or HR performance platform.",
    ],
  },
  demoScenario:
    "Undecided. The wedge demo should come from the founder interview.",
  answers: {},
  feedback: [],
  decisions: [],
};

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, JSON.stringify(seed, null, 2));
  }
}

function readBody(req: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function loadLocalEnv() {
  const envFile = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envFile)) return;

  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key.startsWith("ANTHROPIC_")) {
      process.env[key] = value;
    } else if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseGitHubRepo(input: string) {
  try {
    const url = new URL(input);
    const [owner, repo] = url.pathname.replace(/^\/+/, "").split("/");
    if (!owner || !repo) throw new Error("Missing owner or repo");
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    const [owner, repo] = input.replace(/^github\.com\//, "").split("/");
    if (!owner || !repo) throw new Error("Enter a GitHub repo URL like https://github.com/org/repo");
    return { owner, repo: repo.replace(/\.git$/, "") };
  }
}

async function fetchGitHubContext(repoUrl: string) {
  const { owner, repo } = parseGitHubRepo(repoUrl);
  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "goodhart-police-demo",
  };

  const pullsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=6&sort=updated&direction=desc`, {
    headers,
  });
  if (!pullsResponse.ok) {
    throw new Error(`GitHub returned ${pullsResponse.status} for ${owner}/${repo}`);
  }

  const pulls = (await pullsResponse.json()) as Array<{
    number: number;
    title: string;
    state: string;
    merged_at: string | null;
    user?: { login?: string };
    body: string | null;
    additions: number;
    deletions: number;
    changed_files: number;
    commits: number;
    html_url: string;
  }>;

  const slimPulls = [];
  for (const pull of pulls.slice(0, 4)) {
    const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull.number}/files?per_page=20`, { headers });
    const files = filesResponse.ok
      ? ((await filesResponse.json()) as Array<{ filename: string; additions: number; deletions: number; changes: number }>)
      : [];

    slimPulls.push({
      number: pull.number,
      title: pull.title,
      state: pull.state,
      status: pull.merged_at ? "merged" : pull.state,
      mergedAt: pull.merged_at,
      author: pull.user?.login || "unknown",
      body: (pull.body || "").slice(0, 300),
      additions: pull.additions,
      deletions: pull.deletions,
      changedFiles: pull.changed_files,
      commits: pull.commits,
      url: pull.html_url,
      files: files.slice(0, 6).map((file) => ({
        filename: file.filename,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      })),
    });
  }

  return { owner, repo, pulls: slimPulls };
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Anthropic response did not include a JSON object");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

async function generateImpactDocket(repoUrl: string) {
  loadLocalEnv();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Add it to .env using .env.example.");
  }

  const githubContext = await fetchGitHubContext(repoUrl);
  const prompt = `You are Goodhart Police, a PR review agent for engineering leadership.

Goal: Given GitHub PR metadata, generate an ImpactDocket JSON object. The product should detect when PR activity metrics are being mistaken for business value.

Important philosophy:
- Do not claim code proves customer impact by itself.
- Rank PRs by strength of impact evidence.
- Maintenance can be high impact when it protects an active, valuable workflow.
- If business outcome evidence is missing, say so and propose observability/instrumentation.
- For open PRs, draft a GitHub comment asking the author for intended business outcome and measurement plan.

Return ONLY compact valid JSON matching this TypeScript shape:
{
  "repo": { "owner": string, "name": string, "url": string, "description": string, "customer": string, "sourceNote": string },
  "summary": { "mergedPrsInvestigated": number, "agentsDelegated": number, "highestImpactPr": number, "highestGoodhartRiskPr": number, "evidenceGaps": number },
  "prs": [{
    "number": number,
    "title": string,
    "status": "merged" | "open",
    "author": string,
    "mergedAt": string | null,
    "filesChanged": string[],
    "activity": { "commits": number, "files": number, "linesChanged": number },
    "impactScore": number,
    "goodhartRisk": number,
    "category": string,
    "verdict": string,
    "businessTrace": string[],
    "observabilitySignals": string[],
    "agentFindings": [{ "agent": string, "stance": "high" | "medium" | "low", "finding": string }],
    "measurementPlan": string[],
    "rankReason": string
  }],
  "openPrComment": { "prNumber": number, "body": string }
}

If there is little real evidence in the GitHub data, create plausible MOCK observability signals and label them as mock in the wording. Make the demo crisp.

GitHub context:
${JSON.stringify(githubContext, null, 2)}`;

  const configuredModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const model = configuredModel.endsWith("-latest") || configuredModel.includes("3-5-sonnet")
    ? "claude-sonnet-4-6"
    : configuredModel;

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model,
        max_tokens: 2800,
        temperature: 0.35,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (error) {
    throw new Error(`Anthropic network request failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic returned ${response.status}: ${detail.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = payload.content?.find((part) => part.type === "text")?.text;
  if (!text) throw new Error("Anthropic response did not include text");

  const docket = extractJson(text);
  fs.writeFileSync(generatedDocketFile, JSON.stringify(docket, null, 2));
  return docket;
}

function scopeApi(): Plugin {
  return {
    name: "scope-feedback-api",
    configureServer(server) {
      ensureDataFile();

      server.middlewares.use("/api/state", async (req, res) => {
        if (req.method === "GET") {
          ensureDataFile();
          return sendJson(res, 200, JSON.parse(fs.readFileSync(feedbackFile, "utf8")));
        }

        if (req.method === "POST") {
          try {
            const incoming = (await readBody(req)) as Record<string, unknown>;
            const next = { ...seed, ...incoming, updatedAt: new Date().toISOString() };
            fs.writeFileSync(feedbackFile, JSON.stringify(next, null, 2));
            return sendJson(res, 200, next);
          } catch (error) {
            return sendJson(res, 400, { error: error instanceof Error ? error.message : "Invalid request" });
          }
        }

        sendJson(res, 405, { error: "Method not allowed" });
      });

      server.middlewares.use("/api/docket", async (req, res) => {
        if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
        return sendJson(res, 200, JSON.parse(fs.readFileSync(docketFile, "utf8")));
      });

      server.middlewares.use("/api/analyze", async (req, res) => {
        if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

        try {
          const incoming = (await readBody(req)) as { repoUrl?: string };
          if (!incoming.repoUrl) return sendJson(res, 400, { error: "Missing repoUrl" });
          const docket = await generateImpactDocket(incoming.repoUrl);
          return sendJson(res, 200, docket);
        } catch (error) {
          const fallback = JSON.parse(fs.readFileSync(docketFile, "utf8"));
          fallback.repo.sourceNote = `Seeded fallback because live LLM analysis failed: ${error instanceof Error ? error.message : "Analysis failed"}`;
          return sendJson(res, 200, fallback);
        }
      });

      server.middlewares.use("/api/feedback", async (req, res) => {
        if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

        try {
          const incoming = (await readBody(req)) as { mode?: string; text?: string; tags?: string[] };
          const current = JSON.parse(fs.readFileSync(feedbackFile, "utf8"));
          const entry = {
            id: Date.now().toString(36),
            createdAt: new Date().toISOString(),
            mode: incoming.mode || "note",
            text: incoming.text || "",
            tags: Array.isArray(incoming.tags) ? incoming.tags : [],
          };
          const next = {
            ...current,
            updatedAt: new Date().toISOString(),
            feedback: [entry, ...(current.feedback || [])],
          };
          fs.writeFileSync(feedbackFile, JSON.stringify(next, null, 2));
          sendJson(res, 200, next);
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : "Invalid request" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), scopeApi()],
});
