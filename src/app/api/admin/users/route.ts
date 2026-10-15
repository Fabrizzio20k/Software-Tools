import { NextResponse } from "next/server";
import { createUsers, getKeycloakError, isPortalAdmin, listUsers } from "@/lib/keycloak-admin";

export async function GET() {
  if (!await isPortalAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    return NextResponse.json({ users: await listUsers() });
  } catch (error) {
    const result = getKeycloakError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function POST(request: Request) {
  if (!await isPortalAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    const body = await request.json() as { users?: unknown };
    return NextResponse.json(await createUsers(body.users), { status: 201 });
  } catch (error) {
    const result = getKeycloakError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
