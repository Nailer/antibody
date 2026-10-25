import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  GitBranch,
  ScanLine,
  Check,
} from "lucide-react";
export default function Home() {
  return (
    <main className="marketing">
      <nav className="marketing-nav">
        <Link href="/" className="brand">
          <ShieldCheck size={22} />
          antibody
          <span className="wordmark-dot" />
        </Link>
        <Link href="/app" className="button small">
          Open workspace <ArrowUpRight size={16} />
        </Link>
      </nav>
      <section className="hero">
        <div className="eyebrow">
          <span className="signal" /> INCIDENT RESPONSE, WITH A MEMORY
        </div>
        <h1>
          Fix it once.
          <br />
          <span>Catch it next time.</span>
        </h1>
        <p className="hero-description">
          Turn the lesson from an incident into a tested check. Find the same
          pattern in other projects, then put prevention into your GitLab
          pipeline.
        </p>
        <Link href="/app" className="button">
          Create your first antibody <ArrowRight size={17} />
        </Link>
        <p className="hero-note">
          Built for GitLab. Validated with Semgrep. Approved by you.
        </p>
        <div className="hero-proof">
          <div className="terminal-head">
            <span className="signal" /> THE PREVENTION LOOP <span>01 — 04</span>
          </div>
          <div className="loop">
            <div>
              <GitBranch />
              <strong>A confirmed incident</strong>
              <p>
                The known failure and its fix become your starting evidence.
              </p>
            </div>
            <ArrowRight className="connector" />
            <div>
              <ScanLine />
              <strong>A tested detector</strong>
              <p>
                Detect the unsafe code. Accept the fix. Inspect every result.
              </p>
            </div>
            <ArrowRight className="connector" />
            <div>
              <ShieldCheck />
              <strong>A reusable safeguard</strong>
              <p>Review findings and export an approved CI prevention pack.</p>
            </div>
          </div>
          <div className="proof-bottom">
            <Check size={15} /> Executed checks. Inspectable evidence. No
            invented coverage scores.
          </div>
        </div>
      </section>
      <section className="landing-bottom">
        <h2>
          Your postmortem deserves
          <br />a working next step.
        </h2>
        <p>
          Antibody keeps the connection between what failed, what was tested,
          and what you approved. Start with explicit fixtures and supported code
          patterns. Expand only when the evidence holds.
        </p>
      </section>
      <footer>
        <span>Antibody</span>
        <span>Prevention is a practice.</span>
        <a href="https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase">
          Source repository <ArrowUpRight size={14} />
        </a>
      </footer>
    </main>
  );
}
