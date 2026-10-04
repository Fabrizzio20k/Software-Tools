import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { authSecret, getKeycloakLogoutUrl } from "@/lib/auth";

function clearSessionCookies(response: NextResponse, request: NextRequest) {
  for (const { name } of request.cookies.getAll()) {
    if (!name.startsWith("next-auth.session-token") && !name.startsWith("__Secure-next-auth.session-token")) {
      continue;
    }

    response.cookies.set(name, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse("Origen no permitido.", { status: 403 });
  }

  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });
  const logoutUrl = getKeycloakLogoutUrl(
    typeof token?.idToken === "string" ? token.idToken : undefined,
    new URL(request.url).origin,
  );
  const response = NextResponse.redirect(logoutUrl, { status: 303 });

  clearSessionCookies(response, request);
  return response;
}
