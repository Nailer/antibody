"use client";
import { useState } from "react";
type Status = {
  state: string;
  pipeline: { status: string; url: string } | null;
  requiresSuccessfulPipeline: boolean;
  checkedAt: string;
};
export default function RolloutStatus({ id }: { id: string }) {
  const [status, setStatus] = useState<Status>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div style={{ marginTop: 12 }}>
      <button
        className="text-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch(`/api/gitlab/${id}`);
            const data = await response.json();
            if (!response.ok) throw Error(data.error);
            setStatus(data);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Checking GitLab…" : "Check rollout status"}
      </button>
      {error && (
        <p role="alert" className="error-copy">
          {error}
        </p>
      )}
      {status && (
        <div className="boundary-note">
          <div>
            <p>
              Merge request: <strong>{status.state}</strong>
            </p>
            <p>
              Pipeline:{" "}
              {status.pipeline ? (
                <a
                  href={status.pipeline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {status.pipeline.status}
                </a>
              ) : (
                "No pipeline reported"
              )}
            </p>
            <p>
              {status.requiresSuccessfulPipeline
                ? "Project requires a successful pipeline before merging."
                : "Project does not require a successful pipeline before merging. A failed check alone may not block a merge."}
            </p>
            <small>
              Checked {new Date(status.checkedAt).toLocaleTimeString()}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
