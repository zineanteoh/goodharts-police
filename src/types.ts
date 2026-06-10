export type FeedbackEntry = {
  id: string;
  createdAt: string;
  mode: "mentor-feedback" | "decision" | "note";
  text: string;
  tags: string[];
};

export type ScopeState = {
  updatedAt: string | null;
  projectName: string;
  version: string;
  thesis: string;
  audience: string;
  demoScenario: string;
  answers?: Record<string, string>;
  scope: {
    in: string[];
    out: string[];
  };
  feedback: FeedbackEntry[];
  decisions: Array<{ createdAt: string; text: string }>;
};

export type AgentFinding = {
  agent: string;
  stance: "high" | "medium" | "low";
  finding: string;
};

export type ImpactPr = {
  number: number;
  title: string;
  status: "merged" | "open";
  author: string;
  mergedAt: string | null;
  filesChanged: string[];
  activity: {
    commits: number;
    files: number;
    linesChanged: number;
  };
  impactScore: number;
  goodhartRisk: number;
  category: string;
  verdict: string;
  businessTrace: string[];
  observabilitySignals?: string[];
  agentFindings: AgentFinding[];
  measurementPlan: string[];
  rankReason: string;
};

export type ImpactDocket = {
  repo: {
    owner: string;
    name: string;
    url: string;
    description: string;
    customer: string;
    sourceNote: string;
  };
  summary: {
    mergedPrsInvestigated: number;
    agentsDelegated: number;
    highestImpactPr: number;
    highestGoodhartRiskPr: number;
    evidenceGaps: number;
  };
  prs: ImpactPr[];
  openPrComment: {
    prNumber: number;
    body: string;
  };
};
