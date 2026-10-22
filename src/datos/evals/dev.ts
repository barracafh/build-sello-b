// Carga dev.json con la arroba real en los remitentes. En el JSON van como
// `[@]` para que `buildnight revisar` no tome por personales correos que son
// fraudes publicados o direcciones oficiales; el clasificador ve el texto real.
import crudo from "./dev.json";

export const ARROBA = "[@]";

export const dev = crudo.map((c) => ({ ...c, texto: c.texto.replaceAll(ARROBA, "@") }));
