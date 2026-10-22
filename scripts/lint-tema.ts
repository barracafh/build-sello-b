// Falla si el código deja de usar el tema Sol. Se ejecuta antes de cada build.
// Una línea puede salirse con `// tema-ok: <motivo>` o `/* tema-ok: <motivo> */`.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export type Violacion = { archivo: string; linea: number; regla: string; texto: string };
export type OptOut = { archivo: string; linea: number; motivo: string; texto: string };

const TEMA_CSS = "src/styles/tema.css";
// SHA-256 de src/styles/tema.css tal como lo entrega la plantilla.
const TEMA_CSS_SHA256 = "a735c7e18c6ea70f06b6d389fe53609ac9778425fe24d44d48d82a4b23fd2269";

// Ficheros donde se permite `shadow-*` (elementos que flotan).
const SHADOW_ALLOWLIST: string[] = [];

const FUENTES_PERMITIDAS = ["src/app/layout.tsx", TEMA_CSS];
const UI = "src/components/ui/";

const PALETA =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";
const PREFIJOS_COLOR = "bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|placeholder";
const COLORES_CSS = `${PALETA}|black|white|silver|maroon|navy|olive|aqua|gold|orchid|crimson|coral|salmon|tomato|brown|beige|ivory|khaki|lavender|magenta|plum|tan|turquoise`;

const RE_TEMA_OK = /(?:\/\/|\/\*)\s*tema-ok:\s*((?:(?!\*\/).)*?)\s*(?:\*\/.*)?$/;
const RE_HEX = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g;
const RE_ANCLA = /(?:href|to|id|src|action)=\s*\{?\s*["'`]\s*$/;
const RE_FUNCION_COLOR = /(?<![\w-])(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/;
const RE_COLOR_NOMBRE = new RegExp(
  `(?:\\b(?:color|backgroundColor|borderColor|fill|stroke)|(?:^|[\\s{;])(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|fill|stroke)):\\s*["']?(?:${COLORES_CSS})\\b`,
);
const RE_PALETA = new RegExp(
  `(?<![\\w-])(?:[a-z0-9-]+:)*(?:${PREFIJOS_COLOR}|shadow)-(?:(?:${PALETA})-(?:\\d{2,3}|950)|black|white)(?![\\w-])`,
);
const RE_ARBITRARIO_COLOR = new RegExp(
  `(?<![\\w-])(?:[a-z0-9-]+:)*(?:${PREFIJOS_COLOR})-\\[(?:color:|#|(?:rgba?|hsla?|oklch|oklab)\\(|(?:${COLORES_CSS})\\])`,
);
const RE_RADIO = /(?<![\w-])(?:[a-z0-9-]+:)*rounded(?:-[a-z]{1,2})?-\[/;
const RE_SOMBRA_ARB = /(?<![\w-])(?:[a-z0-9-]+:)*(?:drop-)?shadow-\[/;
const RE_FUENTE_ARB = /(?<![\w-])(?:[a-z0-9-]+:)*font-\[/;
const RE_DARK = /(?:^|[\s"'`{(])(?:[a-z0-9-]+:)*dark:|prefers-color-scheme:\s*dark/;
const RE_DEGRADADO =
  /(?<![\w-])(?:[a-z0-9-]+:)*bg-(?:gradient|linear|radial|conic)-|(?:repeating-)?(?:linear|radial|conic)-gradient\(/;
const RE_SOMBRA = /(?<![\w-])(?:[a-z0-9-]+:)*(?:drop-)?shadow(?:-[^\s"'`]*)?|box-shadow\s*:|boxShadow\s*:/g;
const RE_FUENTE = /next\/font|font-family|fontFamily/;
const RE_CONTROL = /<(?:button|input|textarea)(?![\w-])/;

const quitarOptOut = (linea: string) => linea.replace(RE_TEMA_OK, "");

/** Líneas con su código, sin las que son solo comentario. */
function lineasDeCodigo(codigo: string): { linea: number; texto: string; original: string }[] {
  const salida: { linea: number; texto: string; original: string }[] = [];
  let enBloque = false;
  codigo.split("\n").forEach((original, i) => {
    let texto = original.trim();
    if (enBloque) {
      if (texto.includes("*/")) {
        enBloque = false;
      }
      return;
    }
    if (texto.startsWith("//")) return;
    if (texto.startsWith("/*") || texto.startsWith("{/*")) {
      if (!texto.includes("*/")) enBloque = true;
      if (texto.replace(/^\{?\/\*.*?\*\/\}?/, "").trim() === "") return;
    }
    texto = original;
    salida.push({ linea: i + 1, texto, original });
  });
  return salida;
}

export function optOuts(archivo: string, codigo: string): OptOut[] {
  const salida: OptOut[] = [];
  for (const { linea, original } of lineasDeCodigo(codigo)) {
    const m = original.match(RE_TEMA_OK);
    if (m && m[1]) salida.push({ archivo, linea, motivo: m[1], texto: original.trim() });
  }
  return salida;
}

export function lintSource(archivo: string, codigo: string): Violacion[] {
  const esTema = archivo === TEMA_CSS;
  if (esTema) return [];
  const enUi = archivo.startsWith(UI);
  const violaciones: Violacion[] = [];

  for (const { linea, original } of lineasDeCodigo(codigo)) {
    const m = original.match(RE_TEMA_OK);
    if (m && m[1]) continue;
    const t = quitarOptOut(original);
    const falla = (regla: string) => violaciones.push({ archivo, linea, regla, texto: original.trim() });

    let hayColor = RE_FUNCION_COLOR.test(t) || RE_COLOR_NOMBRE.test(t);
    for (const h of t.matchAll(RE_HEX)) {
      if (!RE_ANCLA.test(t.slice(0, h.index))) hayColor = true;
    }
    if (hayColor) falla("color-literal");
    if (RE_PALETA.test(t)) falla("palette");
    if (RE_ARBITRARIO_COLOR.test(t)) falla("arbitrary-color");
    if (RE_SOMBRA_ARB.test(t)) falla("arbitrary-shadow");
    if (RE_FUENTE_ARB.test(t)) falla("arbitrary-font");
    if (RE_DEGRADADO.test(t)) falla("gradient");
    if (!SHADOW_ALLOWLIST.includes(archivo)) {
      const sombra = [...t.matchAll(RE_SOMBRA)].some(
        (s) => !/^(?:drop-)?shadow-(?:none|\[)/.test(s[0]) && !s[0].startsWith("drop-shadow-["),
      );
      if (sombra) falla("shadow");
    }
    if (!FUENTES_PERMITIDAS.includes(archivo) && RE_FUENTE.test(t)) falla("font");
    if (!enUi) {
      if (RE_RADIO.test(t)) falla("arbitrary-radius");
      if (RE_DARK.test(t)) falla("dark");
      if (RE_CONTROL.test(t)) falla("raw-control");
    }
  }
  return violaciones;
}

function archivosDe(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return archivosDe(ruta);
    return /\.(?:tsx?|jsx?|css|mdx?)$/.test(e.name) ? [ruta] : [];
  });
}

function main() {
  const inicio = performance.now();
  const violaciones: Violacion[] = [];
  const exenciones: OptOut[] = [];

  for (const ruta of archivosDe("src").sort()) {
    const archivo = relative(".", ruta).split("\\").join("/");
    const codigo = readFileSync(ruta, "utf8");
    violaciones.push(...lintSource(archivo, codigo));
    exenciones.push(...optOuts(archivo, codigo));
  }

  const hash = createHash("sha256").update(readFileSync(TEMA_CSS)).digest("hex");
  if (hash !== TEMA_CSS_SHA256) {
    violaciones.push({
      archivo: TEMA_CSS,
      linea: 1,
      regla: "tema-modificado",
      texto: `tema.css no coincide con la plantilla (sha256 ${hash.slice(0, 12)}…, esperado ${TEMA_CSS_SHA256.slice(0, 12)}…). Restáuralo.`,
    });
  }

  for (const v of violaciones) console.error(`${v.archivo}:${v.linea}  [${v.regla}]  ${v.texto}`);
  if (exenciones.length > 0) {
    console.log(`tema-ok (${exenciones.length}):`);
    for (const o of exenciones) console.log(`  ${o.archivo}:${o.linea}  ${o.motivo}`);
  }
  const ms = Math.round(performance.now() - inicio);
  if (violaciones.length > 0) {
    console.error(`\nlint:tema falló: ${violaciones.length} incumplimiento(s) del tema Sol (${ms} ms)`);
    process.exit(1);
  }
  console.log(`lint:tema ok (${ms} ms)`);
}

if (import.meta.main) main();
