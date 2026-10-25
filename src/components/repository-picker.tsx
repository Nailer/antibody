"use client";
import { useState } from "react";
export type RepositoryChoice = { projectId: string; ref: string };
export default function RepositoryPicker({
  value,
  onChange,
}: {
  value?: RepositoryChoice;
  onChange: (value?: RepositoryChoice) => void;
}) {
  const [projects, setProjects] = useState<
      { id: number; path: string; defaultBranch: string }[]
    >([]),
    [branches, setBranches] = useState<string[]>([]),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load(project?: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/repositories?${project ? `project=${encodeURIComponent(project)}` : `search=${encodeURIComponent(search)}`}`,
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      if (project) setBranches(data.branches);
      else setProjects(data.projects);
      if (data.limited)
        setError(
          "Showing the first results. Narrow your search or enter an exact revision.",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className="muted">
        Fetch up to 30 Python files at an immutable commit. Source remains in
        this workspace; skipped files and coverage limits are recorded.
      </p>
      <label htmlFor="project-search">Find an accessible GitLab project</label>
      <input
        id="project-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Project name"
      />
      <button
        type="button"
        className="button secondary"
        disabled={busy}
        onClick={() => void load()}
      >
        {busy ? "Loading GitLab…" : "Find projects"}
      </button>
      <label htmlFor="gitlab-project">GitLab project</label>
      <select
        id="gitlab-project"
        value={value?.projectId || ""}
        onChange={(e) => {
          const p = projects.find((p) => String(p.id) === e.target.value);
          setBranches([]);
          onChange(
            p
              ? { projectId: String(p.id), ref: p.defaultBranch || "main" }
              : undefined,
          );
          if (p) void load(String(p.id));
        }}
      >
        <option value="">Choose a project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.path}
          </option>
        ))}
      </select>
      {value && (
        <>
          <label htmlFor="gitlab-ref">Branch, tag or commit</label>
          <input
            id="gitlab-ref"
            list="gitlab-branches"
            value={value.ref}
            onChange={(e) => onChange({ ...value, ref: e.target.value })}
            required
          />
          <datalist id="gitlab-branches">
            {branches.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </>
      )}
      {error && (
        <p className="error-copy" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
