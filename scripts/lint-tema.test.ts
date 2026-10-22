import { test } from "node:test";
import assert from "node:assert/strict";
import { lintSource, optOuts } from "./lint-tema";

const reglas = (ruta: string, codigo: string) =>
  lintSource(ruta, codigo).map((v) => v.regla);

const PAGINA = "src/app/page.tsx";
const UI = "src/components/ui/button.tsx";

test("color-literal: hex, funciones y propiedades arbitrarias", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="x" style={{ x: "#ff0000" }} />`), ["color-literal"]);
  assert.deepEqual(reglas(PAGINA, `const c = "rgb(0 0 0)";`), ["color-literal"]);
  assert.deepEqual(reglas(PAGINA, `const c = "oklch(0.5 0.1 20)";`), ["color-literal"]);
  assert.deepEqual(reglas(PAGINA, `<i className="[background:#ffd34d]" />`), ["color-literal"]);
  assert.deepEqual(reglas(UI, `const c = "#fff";`), ["color-literal"]);
});

test("color-literal: colores con nombre solo en propiedades de color", () => {
  assert.deepEqual(reglas(PAGINA, `<p style={{ color: "red" }} />`), ["color-literal"]);
  assert.deepEqual(reglas(PAGINA, `a { background-color: white; }`), ["color-literal"]);
  assert.deepEqual(reglas(PAGINA, `<p style={{ color: "inherit" }} />`), []);
  assert.deepEqual(reglas(PAGINA, `const texto = "el rojo es un acento";`), []);
});

test("color-literal: anclas como #add no son colores", () => {
  assert.deepEqual(reglas(PAGINA, `<a href="#add">x</a>`), []);
});

test("palette: clases de la paleta por defecto de Tailwind", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="bg-blue-500" />`), ["palette"]);
  assert.deepEqual(reglas(PAGINA, `<p className="hover:text-gray-700" />`), ["palette"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-white text-black/50" />`), ["palette"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-background text-foreground" />`), []);
  assert.deepEqual(reglas(UI, `<p className="bg-red-500" />`), ["palette"]);
});

test("arbitrary-color: text-[…] solo si contiene un color", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="text-[color:var(--x)]" />`), ["arbitrary-color"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-[red]" />`), ["arbitrary-color"]);
  assert.deepEqual(reglas(PAGINA, `<p className="text-[15px] text-[clamp(1rem,2vw,2rem)]" />`), []);
  assert.deepEqual(reglas(PAGINA, `<p className="leading-[1.2] tracking-[0.1em] grid-cols-[1fr_2fr] max-w-[40ch]" />`), []);
});

test("arbitrary-radius, arbitrary-shadow y arbitrary-font", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="rounded-[12px]" />`), ["arbitrary-radius"]);
  assert.deepEqual(reglas(PAGINA, `<p className="rounded-t-[3px]" />`), ["arbitrary-radius"]);
  assert.deepEqual(reglas(PAGINA, `<p className="shadow-[0_0_4px_black]" />`), ["arbitrary-shadow"]);
  assert.deepEqual(reglas(PAGINA, `<p className="font-[Comic]" />`), ["arbitrary-font"]);
});

test("dark: y prefers-color-scheme", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="bg-background dark:bg-foreground" />`), ["dark"]);
  assert.deepEqual(reglas("src/app/globals.css", `@media (prefers-color-scheme: dark) {`), ["dark"]);
});

test("gradient: clases y funciones CSS", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="bg-gradient-to-r" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-linear-to-b bg-radial-[at_top]" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-linear-to-r" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-radial" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-conic" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="hover:bg-radial bg-conic/50" />`), ["gradient"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-conical bg-radialx" />`), []);
  assert.deepEqual(reglas(PAGINA, `a { background: linear-gradient(var(--a), var(--b)); }`), ["gradient"]);
});

test("shadow: prohibida salvo shadow-none y la lista permitida", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="shadow-md" />`), ["shadow"]);
  assert.deepEqual(reglas(PAGINA, `<p className="shadow" />`), ["shadow"]);
  assert.deepEqual(reglas(PAGINA, `<p className="hover:shadow-lg" />`), ["shadow"]);
  assert.deepEqual(reglas(PAGINA, `a { box-shadow: 0 0 1px var(--x); }`), ["shadow"]);
  assert.deepEqual(reglas(PAGINA, `<p className="shadow-none" />`), []);
});

test("font: next/font y font-family solo en layout.tsx y tema.css", () => {
  assert.deepEqual(reglas(PAGINA, `import { Geist } from "next/font/google";`), ["font"]);
  assert.deepEqual(reglas(PAGINA, `a { font-family: serif; }`), ["font"]);
  assert.deepEqual(reglas("src/app/layout.tsx", `import { Geist } from "next/font/google";`), []);
  assert.deepEqual(reglas("src/styles/tema.css", `a { font-family: serif; }`), []);
});

test("raw-control: button, input y textarea fuera de ui", () => {
  assert.deepEqual(reglas(PAGINA, `<button>ok</button>`), ["raw-control"]);
  assert.deepEqual(reglas(PAGINA, `<input type="text" />`), ["raw-control"]);
  assert.deepEqual(reglas(PAGINA, `<textarea />`), ["raw-control"]);
  assert.deepEqual(reglas(PAGINA, `<Button>ok</Button>`), []);
});

test("src/components/ui exime dark:, radios arbitrarios y controles crudos", () => {
  assert.deepEqual(reglas(UI, `<input className="dark:bg-input rounded-[inherit]" />`), []);
  assert.deepEqual(reglas(UI, `<button className="rounded-[min(var(--radius-md),12px)]" />`), []);
});

test("las líneas que solo son comentarios no cuentan", () => {
  assert.deepEqual(reglas(PAGINA, `// usa #ff0000 y bg-blue-500`), []);
  assert.deepEqual(reglas("src/app/globals.css", `/* dark: #fff */`), []);
  assert.deepEqual(reglas("src/app/globals.css", `/*\n * dark: #fff\n */\na { color: var(--x); }`), []);
});

test("tema-ok con motivo exime la línea y se lista", () => {
  const a = `<p className="bg-blue-500" /> // tema-ok: demo`;
  const b = `<p className="bg-blue-500" /* tema-ok: degradado de la plantilla */ />`;
  assert.deepEqual(reglas(PAGINA, a), []);
  assert.deepEqual(reglas(PAGINA, b), []);
  assert.deepEqual(optOuts(PAGINA, `${a}\n${b}`).map((o) => [o.linea, o.motivo]), [
    [1, "demo"],
    [2, "degradado de la plantilla"],
  ]);
});

test("tema-ok sin motivo no cuenta", () => {
  assert.deepEqual(reglas(PAGINA, `<p className="bg-blue-500" /> // tema-ok:`), ["palette"]);
  assert.deepEqual(reglas(PAGINA, `<p className="bg-blue-500" /* tema-ok: */ />`), ["palette"]);
  assert.deepEqual(optOuts(PAGINA, `<p className="bg-blue-500" /> // tema-ok:`), []);
});

test("informa fichero y línea", () => {
  const [v] = lintSource(PAGINA, `ok\n<p className="bg-blue-500" />`);
  assert.equal(v.archivo, PAGINA);
  assert.equal(v.linea, 2);
});
