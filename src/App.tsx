import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { analyzeRepo, getImpactDocket } from "./api";
import type { ImpactDocket, ImpactPr } from "./types";

const scanSteps = [
  "Fetching merged and open PRs from GitHub",
  "Reading PR titles, descriptions, diffs, and changed files",
  "Checking whether authors stated an impact hypothesis",
  "Joining mock observability signals after merge",
  "Comparing activity metrics against business outcomes",
  "Highlighting PRs that deserve attention",
];

export function App() {
  const {
    data: seededDocket,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["impact-docket"], queryFn: getImpactDocket });
  const analyzeMutation = useMutation({ mutationFn: analyzeRepo });
  const [repoUrl, setRepoUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "scanning" | "results">("input");
  const [activeStep, setActiveStep] = useState(0);
  const [generatedDocket, setGeneratedDocket] = useState<ImpactDocket | null>(
    null,
  );
  const [scanError, setScanError] = useState<string | null>(null);

  if (isLoading)
    return <div className="loading">Loading Goodhart Police...</div>;
  if (isError || !seededDocket)
    return <div className="loading">Could not load the demo data.</div>;

  const docket = generatedDocket ?? seededDocket;
  const topImpact = [...docket.prs]
    .filter((pr) => pr.status === "merged")
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);
  const riskiest = [...docket.prs]
    .filter((pr) => pr.status === "merged")
    .sort((a, b) => b.goodhartRisk - a.goodhartRisk)[0];
  const openPr = docket.prs.find((pr) => pr.status === "open");

  const startScan = () => {
    if (!repoUrl.trim()) return;
    setPhase("scanning");
    setActiveStep(0);
    setGeneratedDocket(null);
    setScanError(null);

    const scanAnimation = new Promise<void>((resolve) => {
      scanSteps.forEach((_, index) => {
        window.setTimeout(() => {
          setActiveStep(index);
          if (index === scanSteps.length - 1) resolve();
        }, index * 620);
      });
    });

    const analysis = analyzeMutation.mutateAsync(repoUrl.trim());

    scanAnimation.then(() => {
      setPhase("results");
    });

    analysis
      .then((nextDocket) => {
        setGeneratedDocket(nextDocket);
      })
      .catch((error: unknown) => {
        setScanError(
          error instanceof Error ? error.message : "Analysis failed",
        );
      });
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="lawQuote">
            "When a measure becomes a target, it ceases to be a good measure."
          </p>
          <h1>Goodhart Police</h1>
        </div>
        <div className="status">
          <span>{phase === "results" ? "Scan complete" : "Ready"}</span>
        </div>
      </header>

      <main className="shell">
        {phase === "input" && (
          <section className="panel intake">
            <div>
              <h2>
                Find PRs that look impactful, suspicious, or under-specified.
              </h2>
            </div>
            <label htmlFor="repoUrl">Repository URL</label>
            <div className="repoInput">
              <input
                id="repoUrl"
                placeholder="https://github.com/ChangePlusPlusVandy/bookem-user"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
              />
              <button disabled={!repoUrl.trim()} onClick={startScan}>
                Find PRs
              </button>
            </div>
            {scanError && (
              <div className="errorBox">
                <strong>LLM analysis did not run.</strong>
                <span>{scanError}</span>
              </div>
            )}
          </section>
        )}

        {phase === "scanning" && (
          <section className="panel scanPanel">
            <p className="eyebrow">Scanning repository</p>
            <h2>{repoUrl.trim()}</h2>
            <div className="scanSteps">
              {scanSteps.map((step, index) => (
                <div
                  className={index <= activeStep ? "scanStep done" : "scanStep"}
                  key={step}
                >
                  <span>
                    {index < activeStep
                      ? "Done"
                      : index === activeStep
                        ? "Now"
                        : "Next"}
                  </span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {phase === "results" && (
          <>
            <section className="panel resultHero">
              <div>
                <p className="eyebrow">Standout PRs</p>
                <h2>4 PRs worth looking at first.</h2>
                <p className="prompt">
                  Quiet wins, suspicious churn, and one open PR missing an
                  impact hypothesis.
                </p>
              </div>
              <div className="statGrid">
                <Fact
                  label="Merged PRs investigated"
                  value={String(docket.summary.mergedPrsInvestigated)}
                />
                <Fact label="Mock observability" value="Attached" />
                <Fact label="Impact hypotheses checked" value="6 / 8" />
                <Fact
                  label="Needs author prompt"
                  value={openPr ? `#${openPr.number}` : "None"}
                />
              </div>
            </section>

            <section className="standoutGrid">
              {topImpact.map((pr, index) => (
                <StandoutCard
                  key={pr.number}
                  pr={pr}
                  label={
                    index === 0
                      ? "Most impactful"
                      : index === 1
                        ? "High-value maintenance"
                        : "Quiet leverage"
                  }
                />
              ))}
              <StandoutCard pr={riskiest} label="Goodhart risk" risky />
            </section>

            <section className="grid">
              <article className="panel">
                <h2>Comment on Open PR</h2>
                <p className="muted">Ask for outcome before merge.</p>
                {openPr && (
                  <p className="openPr">
                    PR #{openPr.number}: {openPr.title}
                  </p>
                )}
                <pre className="commentBox">{docket.openPrComment.body}</pre>
              </article>

              <article className="panel">
                <h2>What This Proves</h2>
                <p className="prompt small">
                  Code is not impact. Goodhart Police connects PRs to
                  hypotheses, code paths, and observability.
                </p>
              </article>
            </section>
          </>
        )}
      </main>
    </>
  );
}

function StandoutCard({
  pr,
  label,
  risky = false,
}: {
  pr: ImpactPr;
  label: string;
  risky?: boolean;
}) {
  return (
    <article
      className={risky ? "panel standoutCard riskyCard" : "panel standoutCard"}
    >
      <div className="cardTop">
        <p className="eyebrow">{label}</p>
        <span className={risky ? "impactBadge risk" : "impactBadge"}>
          {risky ? pr.goodhartRisk : pr.impactScore}
        </span>
      </div>
      <h2>
        PR #{pr.number}: {pr.title}
      </h2>
      <p className="verdict">{pr.verdict}</p>
      <div className="miniStats">
        <Fact label="Commits" value={String(pr.activity.commits)} />
        <Fact label="Files" value={String(pr.activity.files)} />
        <Fact label="Lines" value={String(pr.activity.linesChanged)} />
      </div>
      <h3>Why it stands out</h3>
      <ul className="evidenceList compact">
        {pr.businessTrace.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {pr.observabilitySignals && (
        <>
          <h3>Observed after merge</h3>
          <ul className="evidenceList compact observed">
            {pr.observabilitySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
      <div className="measurement">
        <h3>Observability / measurement</h3>
        <div className="pillRow">
          {pr.measurementPlan.map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function _Score({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="score">
      <span>{label}</span>
      <strong className={danger ? "danger" : ""}>{value}</strong>
    </div>
  );
}
