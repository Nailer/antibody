import { z } from "zod";
export const repositorySelection = z.object({
  projectId: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_./-]+$/),
  ref: z.string().min(1).max(200),
});
export type RepositorySnapshot = {
  projectId: number;
  projectPath: string;
  webUrl: string;
  ref: string;
  commit: string;
  fetchedAt: string;
  scannedFiles: number;
  complete: boolean;
  skipped: { path: string; reason: string }[];
  treeTruncated: boolean;
};
export const incidentInput = z.object({
  title: z.string().trim().min(5).max(120),
  incident: z.string().trim().min(20).max(12000),
  badCode: z.string().min(5).max(50000),
  fixedCode: z.string().min(5).max(50000),
  rule: z.string().min(10).max(30000),
  repositorySource: repositorySelection.optional(),
  extraFixtures: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        code: z.string().min(5).max(20000),
        expectMatch: z.boolean(),
      }),
    )
    .max(8)
    .optional(),
  files: z
    .array(
      z.object({
        path: z
          .string()
          .regex(/^[a-zA-Z0-9_./-]+$/)
          .max(180)
          .refine(
            (p) =>
              !p.split("/").includes("..") &&
              !p.startsWith("/") &&
              p.endsWith(".py"),
            "Use relative Python paths without traversal",
          ),
        content: z.string().max(100000),
      }),
    )
    .max(30)
    .default([]),
});
export type IncidentInput = z.infer<typeof incidentInput>;
export type Finding = {
  path: string;
  line: number;
  message: string;
  ruleId: string;
};
export type Check = { name: string; passed: boolean; detail: string };
export type Antibody = IncidentInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "running" | "validated" | "failed" | "approved";
  checks: Check[];
  findings: Finding[];
  error?: string;
  approvedAt?: string;
  repository?: RepositorySnapshot;
  run?: { id: string; pid: number; startedAt: string };
  derivedFrom?: string;
  synthesis?: { id: number; url: string; status: string; startedAt: string };
  events: { at: string; message: string }[];
};
export const starterRule = `rules:
  - id: antibody.python.requests-tls-disabled
    languages: [python]
    severity: ERROR
    message: TLS certificate verification is disabled. Restore verification or use a trusted CA bundle.
    metadata:
      source: incident-derived
      confidence: HIGH
    patterns:
      - pattern-either:
          - pattern: requests.$METHOD(..., verify=False, ...)
          - pattern: requests.request(..., verify=False, ...)
`;
export const starterBad =
  "import requests\n\ndef fetch_report(url):\n    return requests.get(url, verify=False)\n";
export const starterFixed =
  "import requests\n\ndef fetch_report(url):\n    return requests.get(url, verify=True)\n";
