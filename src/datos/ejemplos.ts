// Nombres de los ejemplos de datos/mensajes-ejemplo.json, por tema. El panel
// es para demos y pruebas, así que junto al nombre ya se enseña si es fraude
// o legítimo y qué veredicto se espera (LAB-52). veredicto.test.ts comprueba
// que no falta ninguno.
export const NOMBRES_EJEMPLOS: Readonly<Record<string, string>> = {
  F01: "Devolución de Hacienda (SMS)",
  F02: "Multa de la DGT (SMS)",
  F03: "Paquete de Correos (SMS)",
  F04: "Tarjeta de la Seguridad Social (SMS)",
  F05: "Recargo de una multa (correo)",
  L01: "Notificación de Hacienda (SMS)",
  L02: "Dirección Electrónica Vial (correo)",
  L03: "Seguimiento de un envío (correo)",
  L04: "Aviso de DEHú (correo)",
  L05: "Cita en el centro de salud (web)",
};

/** F01… son fraudes y L01… mensajes legítimos: lo dice el prefijo del id. */
export function tipoDeEjemplo(id: string): "Fraude" | "Legítimo" | null {
  if (id.startsWith("F")) return "Fraude";
  if (id.startsWith("L")) return "Legítimo";
  return null;
}

/** Los que enseña el panel: uno por veredicto (rojo, amarillo y verde). */
export const EJEMPLOS_PANEL: readonly string[] = [
  "F02", // no_oficial: multa falsa de la DGT
  "L01", // no_determinable: aviso de Hacienda sin enlace
  "L05", // oficial_verificado: web de cita del centro de salud
];
