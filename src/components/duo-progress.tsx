"use client";
import { useState, useRef } from "react";
export default function DuoProgress({
  id,
  initial,
}: {
  id: string;
  initial: { status: string; output?: string; checkedAt?: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copyLabel, setCopyLabel] = useState("Copy proposed rule");
  const [result, setResult] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <p>
        Last observed status: <strong>{result.status}</strong>
      </p>
      <button
        className="text-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch(`/api/gitlab/${id}?action=synthesis`);
            const data = await response.json();
            if (!response.ok) throw Error(data.error);
            setResult(data);
            if (data.errors?.length) setError(data.errors.join("; "));
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Checking Duo…" : "Refresh Duo result"}
      </button>
      {result.checkedAt && (
        <p className="muted">
          Checked {new Date(result.checkedAt).toLocaleTimeString()}
        </p>
      )}
      {error && (
        <p role="alert" className="error-copy">
          {error}
        </p>
      )}
      {result.output && (
        <>
          <button
            className="button secondary full"
            aria-haspopup="dialog"
            onClick={() => dialog.current?.showModal()}
          >
            Review proposed detector and limits
          </button>
          <dialog
            ref={dialog}
            className="proposal-dialog"
            aria-labelledby="proposal-title"
          >
            <h2 id="proposal-title">Proposed detector and limits</h2>
            <p className="muted">
              Actual GitLab Duo output. Review it before importing; Semgrep
              validation and approval remain required.
            </p>
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    const rule = result.output!.match(
                      /```(?:yaml|yml)\s*\n([\s\S]*?)```/,
                    )?.[1];
                    await navigator.clipboard.writeText(rule || result.output!);
                    setCopyLabel(rule ? "Rule copied" : "Proposal copied");
                  } catch {
                    setCopyLabel("Select and copy the text below");
                  }
                }}
              >
                {copyLabel}
              </button>
              <button
                className="button ghost"
                onClick={() => dialog.current?.close()}
              >
                Close proposal
              </button>
            </div>
            <pre>{result.output}</pre>
          </dialog>
        </>
      )}
      <p className="muted">
        Review this proposal, then import it into a separate draft. Real Semgrep
        validation and human approval are still required.
      </p>
    </div>
  );
}
