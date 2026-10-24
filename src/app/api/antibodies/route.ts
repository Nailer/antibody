import { randomUUID } from "node:crypto";
import { incidentInput } from "@/lib/model";
import { listAntibodies, saveAntibody } from "@/lib/store";
export const runtime = "nodejs";
export async function GET() {
  return Response.json(await listAntibodies());
}
export async function POST(req: Request) {
  try {
    const parsed = incidentInput.safeParse(await req.json());
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const now = new Date().toISOString();
    return Response.json(
      await saveAntibody({
        ...parsed.data,
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
  } catch {
    return Response.json(
      { error: "Invalid incident payload." },
      { status: 400 },
    );
  }
}
