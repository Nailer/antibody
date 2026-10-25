import { snapshotRepository } from "@/lib/repository";
import { readJson, RequestError } from "@/lib/http";
import { randomUUID } from "node:crypto";
import { incidentInput } from "@/lib/model";
import { listAntibodies, saveAntibody } from "@/lib/store";
export const runtime = "nodejs";
export async function GET() {
  return Response.json(await listAntibodies());
}
export async function POST(req: Request) {
  try {
    const parsed = incidentInput.safeParse(await readJson(req));
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const { repositorySource, ...input } = parsed.data;
    if (repositorySource && input.files.length)
      return Response.json(
        { error: "Choose repository source or uploads, not both." },
        { status: 400 },
      );
    const snapshot = repositorySource
      ? await snapshotRepository(
          repositorySource.projectId,
          repositorySource.ref,
        )
      : {};
    const now = new Date().toISOString();
    return Response.json(
      await saveAntibody({
        ...input,
        ...snapshot,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        status: "draft",
        checks: [],
        findings: [],
        events: [
          { at: now, message: "Incident recorded. Rule awaits validation." },
        ],
      }),
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid incident payload.",
      },
      { status: error instanceof RequestError ? error.status : 400 },
    );
  }
}
