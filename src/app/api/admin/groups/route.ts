import { NextResponse } from "next/server";
import { getKeycloakError, isPortalAdmin, listGroups } from "@/lib/keycloak-admin";

export async function GET() {
  if (!await isPortalAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  try {
    return NextResponse.json({ groups: await listGroups() });
  } catch (error) {
    const result = getKeycloakError(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
