import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCode2,
  GitPullRequest,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import LandingExample from "@/components/landing-example";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Antibody — Turn a fixed bug into tested prevention",
  description:
    "Turn a confirmed incident into a tested Semgrep detector. Find matching code, review the evidence, and propose a prevention check in GitLab.",
};
const source =
  "https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/43693041/showcase";
const workflow = [
  {
    number: "01",
    icon: FileCode2,
    title: "Start with a bug you understand.",
    text: "Describe the incident. Add the code that failed and the code that fixed it. These examples define what your check must catch and what it must allow.",
    output: "Input: a confirmed incident + unsafe and fixed examples",
  },
  {
    number: "02",
    icon: ScanLine,
    title: "Build a detector. Test both sides.",
    text: "Use an editable starting rule, supply your own, or ask GitLab Duo to propose one. Run Semgrep against the examples, then inspect matches in uploaded Python or a selected GitLab repository.",
    output: "Output: fixture results + source findings",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Review the evidence. Give the approval.",
    text: "Check what matched, what passed, and which files were scanned. Approval stays blocked until the required fixture checks pass. Revise a weak detector into a separate draft without losing its history.",
    output: "Your decision: an approved prevention pack",
  },
  {
    number: "04",
    icon: GitPullRequest,
    title: "Put the lesson into your pipeline.",
    text: "Download the detector, evidence and CI job, or create a GitLab merge request with the check wired into CI. Review the change in your normal development workflow.",
    output: "Outcome: a reusable check for the pattern you tested",
  },
];
const faqs = [
  [
    "What is an “antibody”?",
    "It is a prevention pack for a specific bug pattern: a Semgrep detector, the examples used to validate it, the recorded results, and a CI job you can review and install. The name comes from learning from one incident so you can recognize the same pattern again.",
  ],
  [
    "How is this different from a general security scanner?",
    "Antibody starts with an incident your team has already confirmed. Instead of only showing a list of potential vulnerabilities, it helps you turn that specific lesson into a tested, reviewable check and keep the evidence behind it.",
  ],
  [
    "Do I install an SDK in my application?",
    "No SDK is required for this version. Use the web workspace to enter an incident and supply Python files or select a GitLab repository. To keep checking future changes, install the exported Semgrep CI job or review the rollout merge request Antibody creates.",
  ],
  [
    "What can I use today?",
    "The current version supports Python examples and Semgrep rules, uploaded source and bounded GitLab repository snapshots, real GitLab Duo sessions, approval, exports and rollout merge requests. The hosted integration is scoped to the Antibody showcase project. This is not an unrestricted public GitLab connection service.",
  ],
  [
    "Does AI approve or deploy the fix?",
    "No. Duo can propose a detector and examples. You review the proposal and validate it with Semgrep. A person approves the pack, and rollout creates a merge request rather than merging it. Project merge enforcement depends on your GitLab settings.",
  ],
  [
    "Can anyone open the workspace?",
    "The landing page is public. The hosted workspace is currently protected and requires owner-provided credentials; public account signup is not available yet. You can explore the example here, inspect the open-source code, or run your own instance.",
  ],
  [
    "What happens to the code I provide?",
    "Source and incident evidence are saved in the workspace. Semgrep scans supplied code without executing it. If you start a Duo session, the incident and examples are sent to GitLab for synthesis. Do not submit credentials or sensitive production data to the shared showcase workspace.",
  ],
];
export default function Home() {
  return (
    <div className={styles.landing}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link href="/" className="brand" aria-label="Antibody home">
            <ShieldCheck size={23} aria-hidden="true" />
            antibody
            <span className="wordmark-dot" />
          </Link>
          <nav aria-label="Main navigation" className={styles.navLinks}>
            <a href="#how-it-works">How it works</a>
            <a href="#proof">See the proof</a>
            <a href="#questions">Questions</a>
          </nav>
          <Link href="/app" className={styles.navCta}>
            Open workspace <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main id="main">
        <section
          className={`${styles.shell} ${styles.hero}`}
          aria-labelledby="hero-title"
        >
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <span className={styles.liveDot} /> FROM INCIDENT TO PREVENTION
            </div>
            <h1 id="hero-title">
              You fixed the bug.
              <br />
              <span>Now teach your pipeline to catch it.</span>
            </h1>
            <p className={styles.lead}>
              Antibody turns a bug your team has already fixed into a tested
              code check. Find the same pattern elsewhere, review the evidence,
              and add prevention to GitLab CI.
            </p>
            <div className={styles.actions}>
              <Link href="/app" className="button">
                Open the workspace <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className={styles.quietLink}>
                See how it works <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
            <p className={styles.accessNote}>
              Current workspace requires access credentials. Explore the example
              freely.
            </p>
          </div>
          <LandingExample />
        </section>
        <div className={`${styles.shell} ${styles.foundation}`}>
          <span>THE TOOLS BEHIND THE WORKFLOW</span>
          <p>
            <strong>GitLab Duo</strong> proposes
          </p>
          <p>
            <strong>Semgrep</strong> validates
          </p>
          <p>
            <strong>You</strong> approve
          </p>
          <p>
            <strong>GitLab CI</strong> checks future changes
          </p>
        </div>
        <section className={`${styles.shell} ${styles.context}`}>
          <div>
            <div className={styles.kicker}>THE GAP AFTER THE FIX</div>
            <h2>
              A postmortem explains what happened.
              <br />
              <span>A check helps catch it happening again.</span>
            </h2>
          </div>
          <div>
            <p>
              A developer disables certificate verification to get a request
              working. You spot it, fix it, and write up the incident. But a
              similar line is still sitting in another service.
            </p>
            <p>
              Antibody connects the lesson to something executable: a detector
              tested against the failure and its fix, with findings your team
              can review.
            </p>
            <p className={styles.definition}>
              <ShieldCheck size={19} aria-hidden="true" />
              <span>
                That tested detector and its evidence are your{" "}
                <strong>“antibody.”</strong>
              </span>
            </p>
          </div>
        </section>
        <section
          id="how-it-works"
          className={`${styles.shell} ${styles.workflow}`}
          aria-labelledby="workflow-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <div className={styles.kicker}>THE WORKFLOW</div>
              <h2 id="workflow-title">
                One incident in.
                <br />A reviewable safeguard out.
              </h2>
            </div>
            <p>
              Start in the browser. Keep the approval.
              <br />
              Ship through your existing GitLab workflow.
            </p>
          </div>
          <div className={styles.workflowRows}>
            {workflow.map(({ number, icon: Icon, title, text, output }) => (
              <article className={styles.workflowRow} key={number}>
                <span className={styles.stepNumber}>{number}</span>
                <div className={styles.stepTitle}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{title}</h3>
                </div>
                <div>
                  <p>{text}</p>
                  <span className={styles.stepOutput}>{output}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="proof"
          className={styles.proofSection}
          aria-labelledby="proof-title"
        >
          <div className={`${styles.shell} ${styles.proofLayout}`}>
            <div>
              <div className={styles.kicker}>INSPECT THE EVIDENCE</div>
              <h2 id="proof-title">
                A working prevention loop.
                <br />
                <span>With the receipts.</span>
              </h2>
              <p>
                In a controlled TLS example, a real GitLab prevention job
                rejected an unsafe revision. The corrected revision passed. You
                can inspect both runs and the implementation.
              </p>
              <p className={styles.proofLimit}>
                This proves the tested example, not universal bug coverage. Your
                own rules still need representative examples and review.
              </p>
              <a
                href={`${source}/-/blob/main/docs/evidence/README.md`}
                className={styles.proofLink}
              >
                Read the integration evidence{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.receipts}>
              <a href={`${source}/-/jobs/17450487967`}>
                <span className={styles.receiptIcon}>!</span>
                <div>
                  <span>UNSAFE REVISION</span>
                  <h3>Pattern found. Pipeline failed.</h3>
                  <p>The prevention job rejected the known unsafe code.</p>
                </div>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a href={`${source}/-/jobs/17450507327`}>
                <span className={`${styles.receiptIcon} ${styles.receiptPass}`}>
                  <Check size={18} />
                </span>
                <div>
                  <span>CORRECTED REVISION</span>
                  <h3>Fix accepted. Pipeline passed.</h3>
                  <p>
                    The corrected code passed the installed prevention check.
                  </p>
                </div>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <div className={styles.receiptNote}>
                <GitPullRequest size={16} aria-hidden="true" /> Actual GitLab
                jobs · public, inspectable evidence
              </div>
            </div>
          </div>
        </section>
        <section className={`${styles.shell} ${styles.fit}`}>
          <div>
            <div className={styles.kicker}>
              BUILT FOR THE TEAM AFTER THE INCIDENT
            </div>
            <h2>
              For the engineer fixing it.
              <br />
              And the team responsible for what comes next.
            </h2>
          </div>
          <div className={styles.fitList}>
            <div>
              <h3>Application engineers</h3>
              <p>
                Capture the exact failure and fix. Find matching code without
                rebuilding the incident from memory.
              </p>
            </div>
            <div>
              <h3>Security and platform teams</h3>
              <p>
                Review how a detector behaves before proposing it as a reusable
                CI check.
              </p>
            </div>
            <div>
              <h3>Engineering leads</h3>
              <p>
                Keep a traceable record of the incident, validation, approval
                and proposed rollout.
              </p>
            </div>
          </div>
        </section>
        <section
          id="questions"
          className={`${styles.shell} ${styles.faq}`}
          aria-labelledby="faq-title"
        >
          <div>
            <div className={styles.kicker}>A FEW PRACTICAL QUESTIONS</div>
            <h2 id="faq-title">
              Before you open
              <br />
              the workspace.
            </h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={`${styles.shell} ${styles.finalCta}`}>
          <div>
            <div className={styles.kicker}>GIVE THE FIX A MEMORY</div>
            <h2>
              Bring one incident.
              <br />
              Leave with a check you can review.
            </h2>
            <p>
              Start with the editable Python TLS example, or use a confirmed bug
              from your own work.
            </p>
          </div>
          <div>
            <Link href="/app" className="button">
              Open the workspace <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <span>Access credentials required · no SDK to install</span>
            <a href={`${source}/-/blob/main/README.md`}>
              Prefer to run it yourself? View setup{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <footer className={`${styles.shell} ${styles.footer}`}>
        <Link href="/" className="brand">
          <ShieldCheck size={20} aria-hidden="true" />
          antibody
          <span className="wordmark-dot" />
        </Link>
        <p>Turn lessons into tested prevention.</p>
        <a href={source}>
          Explore the source <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <a href="#main">Back to top ↑</a>
      </footer>
    </div>
  );
}
