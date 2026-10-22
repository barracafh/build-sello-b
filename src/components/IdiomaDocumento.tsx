"use client";

import { useEffect } from "react";

// El layout no se vuelve a pintar con router.replace: al cambiar de idioma con
// el selector (o con atrás/adelante), la página sí, y desde aquí se pone el
// `lang` del documento. En la primera carga ya viene bien del servidor.
export function IdiomaDocumento({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
