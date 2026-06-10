import type { ScopeState } from "./types";

export const interviewQuestions = [
  {
    id: "philosophy",
    title: "What is your philosophy of measurement?",
    body: "When a metric becomes a target, what exactly gets corrupted: the metric, the people, the institution, or the story leaders tell themselves?",
  },
  {
    id: "harm",
    title: "Who are we protecting?",
    body: "If this works, who feels safer or more powerful: executives deploying agents, employees being measured, customers receiving work, or consultants like Eliza?",
  },
  {
    id: "anti_surveillance",
    title: "Where is the creepy line?",
    body: "What would make this feel like surveillance theater? Name the bright line we refuse to cross, even if it would make the dashboard look more impressive.",
  },
  {
    id: "wedge",
    title: "What is the wedge demo?",
    body: "What is the smallest story judges can understand in 60 seconds where the metric is obviously being gamed and our mitigation obviously helps?",
  },
  {
    id: "buyer",
    title: "What would Eliza actually sell?",
    body: "Is this a governance layer, a consulting diagnostic, a workflow design tool, an agent evaluation product, or a credibility artifact for enterprise adoption?",
  },
  {
    id: "win",
    title: "What would make this win?",
    body: "Do we win by being profound, useful, technically impressive, beautiful, funny, brutally relevant to Codex, or unusually honest about AI deployment?",
  },
];

export function submissionCopy(state: ScopeState) {
  const hasPhilosophy = Boolean(state.answers?.philosophy?.trim());
  return {
    whatBuilt: hasPhilosophy
      ? `${state.projectName} is being scoped as a Goodhart's Law mitigation product for enterprise AI workflows. The core premise from the founder interview is: ${state.answers?.philosophy}`
      : "Not ready yet. Answer the philosophy and wedge-demo questions first so the submission sounds like a person with a thesis, not a dashboard template.",
    currentStatus:
      "Current status: rebuilt as a scope interview studio. It now captures the founder's philosophy, constraints, and demo instincts to data/scope-feedback.json before pretending to know the product.",
  };
}
