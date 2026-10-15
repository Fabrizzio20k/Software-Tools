import { NextResponse } from "next/server";
import { deleteUsers, getKeycloakError, isPortalAdmin, setUsersEnabled } from "@/lib/keycloak-admin";

export async function PATCH(request: Request) {
  if (!await isPortalAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    const body = await request.json() as { enabled?: unknown; ids?: unknown };
    if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "La acción no es válida." }, { status: 400 });
    return NextResponse.json(await setUsersEnabled(body.ids, body.enabled));
  } catch (error) {
    const result = getKeycloakError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function DELETE(request: Request) {
  if (!await isPortalAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    const body = await request.json() as { ids?: unknown };
    return NextResponse.json(await deleteUsers(body.ids));
  } catch (error) {
    const result = getKeycloakError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
