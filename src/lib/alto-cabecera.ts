import { useEffect } from "react";

// Publica el alto de la cabecera en --alto-cabecera (en <html>) y lo actualiza
// si cambia (zoom, giro del móvil, menú en dos filas). La caja del mensaje lo
// resta de 100dvh para no pasar del 20 % del alto útil (LAB-69).
export function useAltoCabecera() {
  useEffect(() => {
    const cabecera = document.querySelector("header");
    if (!cabecera) return;
    const raiz = document.documentElement;
    const medir = () =>
      raiz.style.setProperty("--alto-cabecera", `${cabecera.getBoundingClientRect().height}px`);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(cabecera);
    return () => {
      observador.disconnect();
      raiz.style.removeProperty("--alto-cabecera");
    };
  }, []);
}
