"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileCode2,
  GitPullRequest,
  ShieldCheck,
} from "lucide-react";
import styles from "@/app/landing.module.css";

const steps = ["The incident", "The fix", "The check", "The safeguard"];
export default function LandingExample() {
  const [step, setStep] = useState(0);
  return (
    <div className={styles.example}>
      <div className={styles.exampleHeader}>
        <span className={styles.liveDot} /> A BUG BECOMES A SAFEGUARD{" "}
        <FileCode2 size={16} />
      </div>
      <div
        className={styles.exampleTabs}
        role="tablist"
        aria-label="Explore the prevention example"
      >
        {steps.map((label, index) => (
          <button
            key={label}
            id={`example-tab-${index}`}
            role="tab"
            aria-selected={step === index}
            aria-controls="example-panel"
            tabIndex={step === index ? 0 : -1}
            onClick={() => setStep(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % steps.length;
              else if (event.key === "ArrowLeft")
                next = (index + steps.length - 1) % steps.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = steps.length - 1;
              else return;
              event.preventDefault();
              setStep(next);
              document.getElementById(`example-tab-${next}`)?.focus();
            }}
          >
            <span>0{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <div
        id="example-panel"
        role="tabpanel"
        aria-labelledby={`example-tab-${step}`}
        tabIndex={0}
        className={styles.examplePanel}
      >
        <div className={styles.exampleTitle}>
          <span>Python / Requests</span>
          <span>
            {step === 0
              ? "Unsafe code"
              : step === 1
                ? "Corrected code"
                : step === 2
                  ? "Expected validation"
                  : "Reviewable output"}
          </span>
        </div>
        {step < 2 ? (
          <>
            <pre className={styles.code}>
              <code>
                <span className={styles.codeMuted}>01</span>{" "}
                <span className={styles.codeKeyword}>import</span> requests
                {"\n\n"}
                <span className={styles.codeMuted}>03</span> requests.get({"\n"}
                <span className={styles.codeMuted}>04</span>{" "}
                <span className={styles.codeString}>
                  "https://api.example.com"
                </span>
                ,{"\n"}
                <span className={styles.codeMuted}>05</span>{" "}
                <mark className={step === 0 ? styles.unsafe : styles.safe}>
                  verify={step === 0 ? "False" : "True"}
                </mark>
                {"\n"}
                <span className={styles.codeMuted}>06</span> )
              </code>
            </pre>
            <div className={styles.exampleExplanation}>
              <strong>
                {step === 0
                  ? "A request skips certificate verification."
                  : "The fix restores certificate verification."}
              </strong>
              <p>
                {step === 0
                  ? "You fixed this incident. But the same unsafe setting could still exist in another file."
                  : "Antibody uses both examples to test whether a detector catches the bug while accepting the fix."}
              </p>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className={styles.exampleChecks}>
              <div>
                <Check size={17} />
                <span>
                  Known unsafe example<strong>Detected</strong>
                </span>
                <code>verify=False</code>
              </div>
              <div>
                <Check size={17} />
                <span>
                  Known fixed example<strong>Accepted</strong>
                </span>
                <code>verify=True</code>
              </div>
              <div>
                <FileCode2 size={17} />
                <span>
                  Supplied source file<strong>Matching code to review</strong>
                </span>
                <code>client.py:5</code>
              </div>
            </div>
            <div className={styles.exampleExplanation}>
              <strong>Evidence you can inspect.</strong>
              <p>
                The real workspace runs Semgrep on your examples and selected
                source. A match needs human review.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.packPreview}>
              <ShieldCheck size={28} />
              <h3>A prevention pack</h3>
              <p>One detector. Its validation evidence. A GitLab CI check.</p>
              <div>
                <FileCode2 size={15} />
                <code>detector.yml</code>
                <Check size={14} />
              </div>
              <div>
                <FileCode2 size={15} />
                <code>evidence.json</code>
                <Check size={14} />
              </div>
              <div>
                <GitPullRequest size={15} />
                <span>Propose a rollout merge request</span>
                <ArrowRight size={14} />
              </div>
            </div>
            <div className={styles.exampleExplanation}>
              <strong>You decide when it ships.</strong>
              <p>
                Approve validated evidence, then export the pack or propose the
                check in GitLab. Nothing merges automatically.
              </p>
            </div>
          </>
        )}
      </div>
      <div className={styles.exampleFoot}>
        <span>Illustrative walkthrough · no live scan runs here</span>
        <button
          onClick={() => setStep((step + 1) % steps.length)}
          aria-label={step === 3 ? "Restart example" : "Next example step"}
        >
          {step === 3 ? "Start again" : "Next step"}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
