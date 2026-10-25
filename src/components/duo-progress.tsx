"use client";
import { useState } from "react";
export default function DuoProgress({
  id,
  initial,
}: {
  id: string;
  initial: { status: string; output?: string; checkedAt?: string };
}) {
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
        <details>
          <summary>Review proposed detector and limits</summary>
          <pre>{result.output}</pre>
        </details>
      )}
      <p className="muted">
        Review this proposal, then import it into a separate draft. Real Semgrep
        validation and human approval are still required.
      </p>
    </div>
  );
}
