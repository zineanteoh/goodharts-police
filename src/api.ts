import type { ImpactDocket, ScopeState } from "./types";

export async function getImpactDocket(): Promise<ImpactDocket> {
  const response = await fetch("/api/docket");
  if (!response.ok) throw new Error("Could not load impact docket");
  return response.json();
}

export async function analyzeRepo(repoUrl: string): Promise<ImpactDocket> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Could not analyze repository" }));
    throw new Error(payload.error || "Could not analyze repository");
  }
  return response.json();
}

export async function getScopeState(): Promise<ScopeState> {
  const response = await fetch("/api/state");
  if (!response.ok) throw new Error("Could not load scope state");
  return response.json();
}

export async function saveScopeState(state: ScopeState): Promise<ScopeState> {
  const response = await fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error("Could not save scope state");
  return response.json();
}

export async function captureFeedback(input: {
  text: string;
  tags: string[];
  mode?: "mentor-feedback" | "decision" | "note";
}): Promise<ScopeState> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Could not capture feedback");
  return response.json();
}
