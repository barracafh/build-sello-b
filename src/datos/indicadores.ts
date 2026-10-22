// Dominios que un organismo ha publicado expresamente como fraudulentos
// (contexto.md, 4.4 y 4.5). Es la copia local del paso 11: los avisos no
// publican indicadores de forma estructurada, así que se copian a mano.
import type { Source } from "@/components/Fuentes";

const ciberalertas: Source = {
  nombre: "Seguridad Social · Ciberalertas",
  url: "https://www.seg-social.es/wps/portal/wss/internet/HerramientasWeb/ciberseguridad",
};
// Aviso de INCIBE que acompaña a un remitente de Mi Carpeta Ciudadana.
export const incibe165: Source = {
  nombre: "INCIBE-2026-165 · Mi Carpeta Ciudadana",
  url: "https://www.incibe.es/ciudadania/avisos/mi-carpeta-ciudadana-no-esta-enviando-notificaciones-los-ciudadanos-para-recibir",
};
const incibe478: Source = {
  nombre: "INCIBE-2026-478 · Policía Nacional y Guardia Civil",
  url: "https://www.incibe.es/ciudadania/avisos/suplantan-la-policia-nacional-la-guardia-civil-y-incibe-traves-de-notificaciones",
};

export const versionIndicadores = "2026-10-13";

// Dominio registrable (eTLD+1) publicado como fraudulento.
export const indicadores: { dominio: string; fuente: Source; fecha: string }[] = [
  { dominio: "poratlesgsoical-gob.top", fuente: ciberalertas, fecha: "2026-09-21" },
  { dominio: "portalseiq.eu.cc", fuente: ciberalertas, fecha: "2026-09-21" },
  { dominio: "portal-seg-social.help", fuente: ciberalertas, fecha: "2026-09-21" },
  { dominio: "seg-socioal.cfd", fuente: ciberalertas, fecha: "2026-09-21" },
  { dominio: "portaliseg-socialgobs.clik", fuente: ciberalertas, fecha: "2026-09-21" },
  { dominio: "info.com.es", fuente: incibe165, fecha: "2026-03-04" },
  { dominio: "actc.center", fuente: incibe478, fecha: "2026-07-10" },
  { dominio: "policiaciberdelincuencia.com", fuente: incibe478, fecha: "2026-07-10" },
];
