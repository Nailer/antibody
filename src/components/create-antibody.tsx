"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, FileCode2, Clock, Loader2 } from "lucide-react";
import { starterBad, starterFixed, starterRule } from "@/lib/model";
import AdditionalFixtures, { type ExtraFixture } from "./additional-fixtures";
import { type Antibody } from "@/lib/model";
import RepositoryPicker, { type RepositoryChoice } from "./repository-picker";
import { PageHeading } from "./workspace-ui";
export default function Create({
  onCancel,
  onCreate,
  initial,
}: {
  initial?: Antibody;
  onCancel: () => void;
  onCreate: (data: unknown) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || ""),
    [incident, setIncident] = useState(initial?.incident || ""),
    [bad, setBad] = useState(initial?.badCode || ""),
    [fixed, setFixed] = useState(initial?.fixedCode || ""),
    [rule, setRule] = useState(initial?.rule || starterRule),
    [files, setFiles] = useState<{ path: string; content: string }[]>(
      initial?.files || [],
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [extraFixtures, setExtraFixtures] = useState<ExtraFixture[]>(
    initial?.extraFixtures || [],
  );
  const draftKey = initial
    ? `antibody-draft-${initial.id}`
    : "antibody-draft-new";
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        const d = JSON.parse(saved);
        setTitle(d.title || "");
        setIncident(d.incident || "");
        setBad(d.bad || "");
        setFixed(d.fixed || "");
        setRule(d.rule || starterRule);
        setExtraFixtures(d.extraFixtures || []);
      }
    } catch {}
  }, [draftKey]);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({ title, incident, bad, fixed, rule, extraFixtures }),
        );
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [draftKey, title, incident, bad, fixed, rule, extraFixtures]);
  const [sourceMode, setSourceMode] = useState("upload");
  const [repositorySource, setRepositorySource] = useState<RepositoryChoice>();
  return (
    <>
      <button className="back-button" onClick={onCancel}>
        <ArrowLeft size={16} /> Back to antibodies
      </button>
      <PageHeading
        eyebrow="NEW ANTIBODY"
        title={
          initial ? "Review a new detector version." : "Start with what failed."
        }
        description={
          initial
            ? "Paste reviewed proposal YAML and fixtures, or revise the existing detector. Saving creates a separate draft; the original evidence is retained."
            : "Record the incident, supply both sides of the fix, and define a detector we can actually test."
        }
      />
      <form
        className="create-layout"
        onSubmit={async (e) => {
          e.preventDefault();
          if (sourceMode === "repository" && !repositorySource) {
            setError("Choose a GitLab project first.");
            return;
          }
          setBusy(true);
          setError("");
          try {
            await onCreate({
              title,
              incident,
              badCode: bad,
              fixedCode: fixed,
              rule,
              extraFixtures,
              files: sourceMode === "repository" ? [] : files,
              repositorySource:
                sourceMode === "repository" ? repositorySource : undefined,
            });
            sessionStorage.removeItem(draftKey);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <section className="panel form-panel">
            <div className="section-heading">
              <h2>
                <span className="step-number">01</span> Incident context
              </h2>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setTitle("TLS verification disabled in report fetcher");
                  setIncident(
                    "An incident review found that the Python Requests client disabled TLS certificate verification. The fix restores certificate verification. Check for the same explicit pattern in other code.",
                  );
                  setBad(starterBad);
                  setFixed(starterFixed);
                  setRule(starterRule);
                }}
              >
                Use TLS example
              </button>
            </div>
            <label htmlFor="title">Incident title</label>
            <input
              id="title"
              required
              minLength={5}
              maxLength={120}
              placeholder="What happened?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="incident">Confirmed failure and lesson</label>
            <textarea
              id="incident"
              required
              minLength={20}
              rows={4}
              placeholder="Describe the confirmed failure, its cause, and what the fix changed."
              value={incident}
              onChange={(e) => setIncident(e.target.value)}
            />
          </section>
          <section className="panel form-panel">
            <h2>
              <span className="step-number">02</span> Known bad → known fix
            </h2>
            <p className="muted">
              Python source only. Code is scanned, never executed.
            </p>
            <label htmlFor="bad">Code that should match</label>
            <textarea
              id="bad"
              className="code-input"
              required
              rows={6}
              value={bad}
              onChange={(e) => setBad(e.target.value)}
              spellCheck={false}
              placeholder="Paste the unsafe code"
            />
            <label htmlFor="fixed">Corrected code that should pass</label>
            <textarea
              id="fixed"
              className="code-input"
              required
              rows={6}
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
              spellCheck={false}
              placeholder="Paste the corrected code"
            />
          </section>
          <AdditionalFixtures
            value={extraFixtures}
            onChange={setExtraFixtures}
          />
          <section className="panel form-panel">
            <h2>
              <span className="step-number">03</span> Detection rule
            </h2>
            <p className="muted">
              The starter is a maintained Python Requests TLS rule, not
              AI-generated output. Replace it with your own single-rule Semgrep
              YAML when needed.
            </p>
            <label htmlFor="rule">Semgrep rule YAML</label>
            <textarea
              id="rule"
              className="code-input"
              required
              rows={15}
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              spellCheck={false}
            />
          </section>
          <section className="panel form-panel">
            <h2>
              <span className="step-number">04</span> Look for the pattern
              elsewhere
            </h2>
            <label htmlFor="source-mode">Source for exposure scanning</label>
            <select
              id="source-mode"
              value={sourceMode}
              onChange={(e) => setSourceMode(e.target.value)}
            >
              <option value="upload">Upload Python files</option>
              <option value="repository">GitLab repository</option>
            </select>
            {sourceMode === "repository" ? (
              <RepositoryPicker
                value={repositorySource}
                onChange={setRepositorySource}
              />
            ) : (
              <>
                <p className="muted">
                  Optional. Upload up to 30 Python files to scan. Files stay in
                  this workspace. No repository access is implied.
                </p>
                <label htmlFor="files" className="upload">
                  Choose Python files <Plus size={16} />
                </label>
                <input
                  id="files"
                  type="file"
                  accept=".py"
                  multiple
                  className="file-input"
                  onChange={async (e) => {
                    const selected = Array.from(e.target.files || []);
                    if (
                      selected.length > 30 ||
                      selected.some((f) => f.size > 100000)
                    ) {
                      setError("Choose up to 30 files, each below 100 KB.");
                      return;
                    }
                    const incoming = await Promise.all(
                      selected.map(async (f) => ({
                        path: f.name,
                        content: await f.text(),
                      })),
                    );
                    if (
                      new Set(incoming.map((f) => f.path)).size !==
                      incoming.length
                    ) {
                      setError("File names must be unique.");
                      return;
                    }
                    setFiles(incoming);
                  }}
                />
                {files.map((f) => (
                  <div className="attached-file" key={f.path}>
                    <FileCode2 size={15} />
                    {f.path}
                    <span>{f.content.length} characters</span>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
        <aside>
          <section className="panel sticky">
            <div className="eyebrow">WHAT HAPPENS NEXT</div>
            <h2>
              Evidence first.
              <br />
              Approval second.
            </h2>
            <p className="muted">
              Unfinished text is saved in this browser tab. File uploads must be
              reselected after a refresh. Close the tab to clear unsaved text.
            </p>
            <p>
              Your draft is saved before any scan starts. Run validation from
              the detail page, review the findings, then approve the pack for
              export.
            </p>
            <div className="boundary-note">
              <Clock size={17} />
              <span>
                Validation can take up to two minutes. You can return to the
                workspace while it runs.
              </span>
            </div>
            {error && (
              <p role="alert" className="error-copy">
                {error}
              </p>
            )}
            <button type="submit" className="button full" disabled={busy}>
              {busy ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <Plus size={16} />
              )}{" "}
              {busy
                ? "Saving incident…"
                : initial
                  ? "Save new draft version"
                  : "Create draft antibody"}
            </button>
            <button
              type="button"
              className="button ghost full"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </button>
          </section>
        </aside>
      </form>
    </>
  );
}
