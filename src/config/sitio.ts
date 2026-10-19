// El repo de cada equipo trae aquí su enlace a issues; no lo cambies.
export const site = {
  feedbackUrl: "https://github.com/barracafh/build-sello-b/issues/new",
};

// <Link> añade la ruta del equipo. Para fetch e imágenes de public/ (también
// next/image), usa fetch(ruta("/api/ia")) y src={ruta("/foto.png")}.
export const ruta = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
