// Nombres de los ejemplos de datos/mensajes-ejemplo.json, por tema y sin
// adelantar el veredicto. veredicto.test.ts comprueba que no falta ninguno.
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
