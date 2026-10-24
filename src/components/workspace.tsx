"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Layers,
  Plug,
  ArrowUpRight,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  FileCode2,
  Download,
  Play,
  Loader2,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Menu,
  X,
  GitBranch,
} from "lucide-react";
import { type Antibody } from "@/lib/model";
import Create from "./create-antibody";
import { PageHeading, Integration, ScanIcon } from "./workspace-ui";
type View = "overview" | "antibodies" | "integrations" | "create" | "detail";
type Settings = {
  semgrep: boolean;
  gitlab: boolean;
  duo: boolean;
  gitlabUrl: string;
  storage: string;
  accessProtected: boolean;
};
async function request(path: string, body?: unknown) {
  const res = await fetch(
    path,
    body !== undefined
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Request failed. Please try again.");
  return data;
}
function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value}`}>
      <span />
      {value === "running"
        ? "Validating"
        : value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}
const date = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export default function Workspace() {
  const [view, setView] = useState<View>("overview"),
    [items, setItems] = useState<Antibody[]>([]),
    [selected, setSelected] = useState<string>(),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [settings, setSettings] = useState<Settings>(),
    [notice, setNotice] = useState("");
  const refresh = useCallback(async () => {
    try {
      setItems(await request("/api/antibodies"));
      setSettings(await request("/api/settings"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const active = items.find((a) => a.id === selected);
  useEffect(() => {
    if (!items.some((a) => a.status === "running")) return;
    const timer = setInterval(() => void refresh(), 2500);
    return () => clearInterval(timer);
  }, [items, refresh]);
  function navigate(next: View) {
    setView(next);
    setMobile(false);
    setError("");
    setNotice("");
  }
  async function action(name: string) {
    if (!active) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/antibodies/${active.id}/${name}`, {});
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const counts = {
    approved: items.filter((a) => a.status === "approved").length,
    validated: items.filter(
      (a) => a.status === "validated" || a.status === "approved",
    ).length,
    findings: items.reduce((sum, a) => sum + a.findings.length, 0),
  };
  return (
    <div className="workspace">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <Link href="/" className="brand">
          <ShieldCheck size={23} />
          antibody
          <span className="wordmark-dot" />
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
        <div className="workspace-label">
          WORKSPACE <span>LOCAL</span>
        </div>
        <nav aria-label="Main navigation">
          {(
            [
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "antibodies", label: "Antibodies", icon: Layers },
              { id: "integrations", label: "Integrations", icon: Plug },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              className={
                view === n.id ||
                (n.id === "antibodies" && ["create", "detail"].includes(view))
                  ? "nav-item selected"
                  : "nav-item"
              }
              onClick={() => navigate(n.id)}
            >
              <n.icon size={18} />
              {n.label}
              {n.id === "antibodies" && (
                <span className="nav-count">{items.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="eyebrow">A LESSON THAT LASTS</div>
          <p>
            One incident.
            <br />A stronger next release.
          </p>
          <a
            href="https://github.com/Nailer/antibody"
            target="_blank"
            rel="noreferrer"
          >
            Project documentation <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="operator">
          <span className="avatar">OP</span>
          <div>
            <strong>Workspace operator</strong>
            <small>
              {settings?.accessProtected
                ? "Access protected"
                : "Local workstation"}
            </small>
          </div>
          <span className="signal" />
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>
          <div>
            Workspace <ChevronRight size={14} />{" "}
            <strong>
              {view === "detail"
                ? active?.title || "Antibody"
                : view === "create"
                  ? "New antibody"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
            </strong>
          </div>
          <span className="topbar-state">
            <span className="signal" /> Evidence before enforcement
          </span>
        </header>
        <main className="content">
          {error && (
            <div role="alert" className="banner error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => void refresh()}>Retry</button>
            </div>
          )}
          {notice && (
            <div role="status" className="banner">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}
          {loading ? (
            <div className="skeleton-layout" aria-label="Loading workspace">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : view === "create" ? (
            <Create
              onCancel={() => navigate("antibodies")}
              onCreate={async (input) => {
                const a = await request("/api/antibodies", input);
                await refresh();
                setSelected(a.id);
                navigate("detail");
              }}
            />
          ) : view === "integrations" ? (
            <>
              <PageHeading
                eyebrow="CONNECTED SYSTEMS"
                title="Make the loop executable."
                description="Validation runs locally. GitLab connections are configured on the server; credentials never reach your browser."
              />
              <div className="integration-grid">
                <Integration
                  name="Semgrep"
                  icon={<ScanIcon />}
                  enabled={!!settings?.semgrep}
                  description="Executes the detector against your actual fixtures and supplied Python files."
                  detail={
                    settings?.semgrep
                      ? "Installed · local scan engine"
                      : "Not installed · run scripts/setup.sh"
                  }
                />
                <Integration
                  name="GitLab"
                  icon={<GitBranch />}
                  enabled={!!settings?.gitlab}
                  description="Creates reviewable prevention merge requests in the configured GitLab project."
                  detail={
                    settings?.gitlab
                      ? "Credential configured · verify with a live request"
                      : "Set GITLAB_TOKEN and GITLAB_PROJECT_ID"
                  }
                />
                <Integration
                  name="GitLab Duo"
                  icon={<Layers />}
                  enabled={!!settings?.duo}
                  description="Starts an incident-to-rule synthesis session in your enabled catalog flow."
                  detail={
                    settings?.duo
                      ? "Catalog flow configured · live execution required"
                      : "Set GITLAB_FLOW_CONSUMER_ID to enable"
                  }
                />
              </div>
              <section className="panel configuration">
                <h2>Deployment boundaries</h2>
                <p>
                  {settings?.storage}. This workspace is designed for a single
                  operator. Protect remote deployments with ACCESS_TOKEN and
                  HTTPS.
                </p>
                <p>
                  GitLab project permissions and Duo execution must be verified
                  in your namespace. A configured credential is not a successful
                  connection.
                </p>
                <a
                  href="https://github.com/Nailer/antibody"
                  className="text-link"
                >
                  Read installation and deployment guidance{" "}
                  <ArrowUpRight size={15} />
                </a>
              </section>
            </>
          ) : view === "detail" && active ? (
            <>
              <button
                className="back-button"
                onClick={() => navigate("antibodies")}
              >
                <ArrowLeft size={16} /> All antibodies
              </button>
              <div className="detail-heading">
                <div>
                  <div className="eyebrow">
                    ANTIBODY / {active.id.slice(0, 8)}
                  </div>
                  <h1>{active.title}</h1>
                  <p>Recorded {date(active.createdAt)} · Python detector</p>
                </div>
                <Status value={active.status} />
              </div>
              <div className="detail-layout">
                <div>
                  <section className="panel">
                    <div className="section-heading">
                      <h2>Validation evidence</h2>
                      <span className="muted">Executed by Semgrep</span>
                    </div>
                    {active.checks.length ? (
                      active.checks.map((c) => (
                        <div key={c.name} className="check-row">
                          {c.passed ? (
                            <CheckCircle2 className="green" size={20} />
                          ) : (
                            <XCircle className="red" size={20} />
                          )}
                          <div>
                            <strong>{c.name}</strong>
                            <p>{c.detail}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="inline-empty">
                        <FileCode2 size={25} />
                        <p>
                          Run validation to test this rule against the incident
                          and its fix.
                        </p>
                      </div>
                    )}
                    {active.error && (
                      <p className="error-copy">{active.error}</p>
                    )}
                    <div className="panel-footer">
                      <p>
                        {active.status === "running"
                          ? "Scanning real fixtures. This can take up to two minutes."
                          : "Two fixture checks establish a starting point, not a general accuracy guarantee."}
                      </p>
                      <button
                        className="button small"
                        disabled={
                          busy ||
                          active.status === "running" ||
                          active.status === "approved"
                        }
                        onClick={() => void action("validate")}
                      >
                        {busy || active.status === "running" ? (
                          <Loader2 className="spin" size={15} />
                        ) : (
                          <Play size={15} />
                        )}{" "}
                        {active.status === "running"
                          ? "Validating…"
                          : "Run validation"}
                      </button>
                    </div>
                  </section>
                  <section className="panel">
                    <div className="section-heading">
                      <h2>Exposure findings</h2>
                      <span className="count">{active.findings.length}</span>
                    </div>
                    {active.findings.length ? (
                      <div className="findings">
                        {active.findings.map((f, i) => (
                          <div className="finding" key={i}>
                            <FileCode2 size={18} />
                            <div>
                              <code>
                                {f.path}:{f.line}
                              </code>
                              <p>{f.message}</p>
                            </div>
                            <span className="status draft">Needs review</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="inline-empty">
                        <ShieldCheck size={24} />
                        <p>
                          {active.status === "draft"
                            ? "Files will be scanned when validation runs."
                            : active.files.length
                              ? "No matches found in supplied files. This does not prove they are defect-free."
                              : "No project files supplied. Fixture validation does not establish cross-project coverage."}
                        </p>
                      </div>
                    )}
                  </section>
                  <section className="panel">
                    <h2>Incident context</h2>
                    <p className="incident-copy">{active.incident}</p>
                    <details>
                      <summary>Detection rule</summary>
                      <pre>{active.rule}</pre>
                    </details>
                    <div className="fixture-columns">
                      <details>
                        <summary>Known bad code</summary>
                        <pre>{active.badCode}</pre>
                      </details>
                      <details>
                        <summary>Known fix</summary>
                        <pre>{active.fixedCode}</pre>
                      </details>
                    </div>
                  </section>
                </div>
                <div>
                  <section className="panel approval">
                    <div className="eyebrow">HUMAN CHECKPOINT</div>
                    <h2>
                      {active.status === "approved"
                        ? "Approved for export"
                        : "Review before rollout"}
                    </h2>
                    <p>
                      Review the rule, fixtures, and findings. Approval freezes
                      this pack; it does not install anything in GitLab.
                    </p>
                    {active.status === "approved" ? (
                      <>
                        <div className="approved-note">
                          <CheckCircle2 size={18} /> Approved{" "}
                          {date(active.approvedAt!)}
                        </div>
                        {[
                          ["rule", "Detection rule"],
                          ["ci", "GitLab CI job"],
                          ["evidence", "Validation evidence"],
                        ].map(([name, label]) => (
                          <a
                            className="download"
                            key={name}
                            href={`/api/antibodies/${active.id}/${name}`}
                          >
                            <Download size={16} />
                            {label}
                            <ArrowUpRight size={14} />
                          </a>
                        ))}
                        <p className="small-copy">
                          Copy the rule into{" "}
                          <code>.antibody/{active.id}.yml</code> and include the
                          exported CI job.
                        </p>
                        <button
                          className="button secondary full"
                          disabled={busy || !settings?.gitlab}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              const r = await request(
                                `/api/gitlab/${active.id}`,
                                { action: "rollout" },
                              );
                              setNotice(
                                `GitLab merge request created: ${r.url}`,
                              );
                            } catch (e) {
                              setError((e as Error).message);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Open rollout MR <ArrowUpRight size={15} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="button full"
                        disabled={busy || active.status !== "validated"}
                        onClick={() => void action("approve")}
                      >
                        <ShieldCheck size={16} /> Approve prevention pack
                      </button>
                    )}
                    <div className="boundary-note">
                      <AlertCircle size={15} />
                      <span>
                        {active.status === "approved"
                          ? "Export ready. Enforcement begins only after installation and a successful GitLab pipeline."
                          : "Approval unlocks only after both fixture checks pass."}
                      </span>
                    </div>
                  </section>
                  <section className="panel">
                    <h2>Activity</h2>
                    <ol className="timeline">
                      {active.events.map((e, i) => (
                        <li key={i}>
                          <span />
                          <div>
                            <p>{e.message}</p>
                            <time>{date(e.at)}</time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                  {settings?.duo && (
                    <section className="panel">
                      <h2>Duo synthesis</h2>
                      <p className="muted">
                        Start a real GitLab session with this incident. Review
                        its proposed rule before creating a new version.
                      </p>
                      <button
                        className="button secondary full"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            const r = await request(
                              `/api/gitlab/${active.id}`,
                              { action: "synthesize" },
                            );
                            setNotice(`Duo session started: ${r.url}`);
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Start Duo session <ExternalLink size={14} />
                      </button>
                    </section>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <PageHeading
                eyebrow={
                  view === "overview"
                    ? "PREVENTION WORKSPACE"
                    : "YOUR RULE REGISTRY"
                }
                title={
                  view === "overview"
                    ? "Give the next release a head start."
                    : "Lessons, made executable."
                }
                description={
                  view === "overview"
                    ? "Validate what you learned. Find the pattern elsewhere. Approve the check that catches it next time."
                    : "Every antibody starts with an incident and earns approval through evidence."
                }
                action={
                  <button className="button" onClick={() => navigate("create")}>
                    <Plus size={17} /> New antibody
                  </button>
                }
              />
              {view === "overview" && (
                <div className="metrics">
                  <div>
                    <span>Antibodies recorded</span>
                    <strong>{items.length.toString().padStart(2, "0")}</strong>
                    <small>Confirmed lessons to investigate</small>
                  </div>
                  <div>
                    <span>Validated detectors</span>
                    <strong>
                      {counts.validated.toString().padStart(2, "0")}
                    </strong>
                    <small>Bad and fixed fixtures checked</small>
                  </div>
                  <div>
                    <span>Approved packs</span>
                    <strong>
                      {counts.approved.toString().padStart(2, "0")}
                    </strong>
                    <small>Ready for reviewed rollout</small>
                  </div>
                  <div>
                    <span>Patterns found</span>
                    <strong>
                      {counts.findings.toString().padStart(2, "0")}
                    </strong>
                    <small>Matches awaiting human assessment</small>
                  </div>
                </div>
              )}
              <section className="registry">
                <div className="section-heading">
                  <h2>
                    {view === "overview"
                      ? "Recent antibodies"
                      : "All antibodies"}
                  </h2>
                  <span className="muted">{items.length} recorded</span>
                </div>
                {items.length ? (
                  <div className="registry-list">
                    <div className="table-label">
                      <span>INCIDENT / DETECTOR</span>
                      <span>STATUS</span>
                      <span>RECORDED</span>
                    </div>
                    {items.map((a) => (
                      <button
                        className="registry-row"
                        key={a.id}
                        onClick={() => {
                          setSelected(a.id);
                          navigate("detail");
                        }}
                      >
                        <span className="row-identity">
                          <span className="file-icon">
                            <ShieldCheck size={20} />
                          </span>
                          <span>
                            <strong>{a.title}</strong>
                            <small>
                              {a.files.length} source files ·{" "}
                              {a.findings.length} matches
                            </small>
                          </span>
                        </span>
                        <Status value={a.status} />
                        <span className="row-date">
                          {date(a.createdAt)} <ChevronRight size={16} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-illustration">
                      <div />
                      <ShieldCheck size={36} />
                      <div />
                    </div>
                    <div className="eyebrow">START WITH ONE LESSON</div>
                    <h2>
                      Your first incident can protect
                      <br />
                      your next release.
                    </h2>
                    <p>
                      Bring the failing code and its fix. Test a detector
                      against both, then look for the pattern in other files.
                    </p>
                    <button
                      className="button"
                      onClick={() => navigate("create")}
                    >
                      Create an antibody <ArrowRight size={16} />
                    </button>
                    <span className="small-copy">
                      No sample findings. Your workspace starts empty.
                    </span>
                  </div>
                )}
              </section>
              {view === "overview" && (
                <div className="workspace-bottom">
                  <div>
                    <span className="step-number">01</span>
                    <h3>Start with the evidence</h3>
                    <p>
                      A confirmed failure and correction give your rule a
                      testable foundation.
                    </p>
                  </div>
                  <div>
                    <span className="step-number">02</span>
                    <h3>Keep the human checkpoint</h3>
                    <p>
                      Inspect the result before exporting or proposing a GitLab
                      rollout.
                    </p>
                  </div>
                  <div>
                    <span className="step-number">03</span>
                    <h3>Know what was checked</h3>
                    <p>
                      Fixture results and file matches stay separate from
                      unproven coverage claims.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
        <footer className="app-footer">
          <span>ANTIBODY / PREVENTION WITH EVIDENCE</span>
          <span>
            {settings?.semgrep ? "Semgrep ready" : "Semgrep setup required"}
          </span>
        </footer>
      </div>
    </div>
  );
}
