import { NextResponse, type NextRequest } from "next/server";
import { CABECERA_IDIOMA, resolverIdioma } from "@/i18n";

// El layout no recibe searchParams: el proxy resuelve el idioma (?lang,
// Accept-Language o es) y lo pasa en una cabecera que leen layout y página.
export function proxy(request: NextRequest) {
  const idioma = resolverIdioma(
    request.nextUrl.searchParams.getAll("lang"),
    request.headers.get("accept-language"),
  );
  const cabeceras = new Headers(request.headers);
  cabeceras.set(CABECERA_IDIOMA, idioma);
  return NextResponse.next({ request: { headers: cabeceras } });
}

export const config = {
  // "/" aparte: con basePath, la raíz /sello-b no encaja en el patrón general.
  matcher: ["/", "/((?!_next/|api/|.*\\..*).*)"],
};
