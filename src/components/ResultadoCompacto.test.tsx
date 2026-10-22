import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { formularioPlegado } from "@/lib/formulario";
import { AnalizarMensaje } from "./AnalizarMensaje";
import { BarraComprobado } from "./BarraComprobado";
import { CompartirFamilia } from "./CompartirFamilia";
import { Desmentidos } from "./Desmentidos";
import { MensajeSenalado } from "./MensajeSenalado";

// LAB-69: con un resultado, la página cabe en una pantalla; lo demás, a un clic.
describe("formulario plegado", () => {
  test("se pliega solo cuando hay resultado", () => {
    assert.equal(formularioPlegado(null), false);
    assert.equal(formularioPlegado({ veredicto: "no_oficial" }), true);
  });

  test("sin resultado se ve el formulario y no la barra", () => {
    const html = renderToStaticMarkup(<AnalizarMensaje intro={<p>Entradilla</p>} />);
    assert.match(html, /Pega aquí el mensaje/);
    assert.match(html, /Entradilla/);
    assert.doesNotMatch(html, /Mensaje comprobado/);
  });

  test("la barra dice que está comprobado y ofrece comprobar otro", () => {
    const html = renderToStaticMarkup(<BarraComprobado onOtro={() => {}} />);
    assert.match(html, /Mensaje comprobado/);
    assert.match(html, /<button[^>]*>[\s\S]*Comprobar otro mensaje[\s\S]*<\/button>/); // tema-ok: busca el botón en el HTML renderizado
  });
});

describe("compartir compacto", () => {
  const html = renderToStaticMarkup(
    <CompartirFamilia texto="Me ha llegado este mensaje" onCopiarEnlace={async () => "ok"} />,
  );

  test("WhatsApp, copiar texto y copiar enlace en un solo grupo", () => {
    assert.match(html, /WhatsApp/);
    assert.match(html, /Copiar texto/);
    assert.match(html, /Copiar enlace/);
  });

  test("el texto editable va dentro de un desplegable cerrado", () => {
    assert.match(html, /<details(?![^>]*\bopen)[^>]*>\s*<summary[^>]*>[\s\S]*Ver y editar el texto/);
    assert.match(html, /<details[^>]*>[\s\S]*<textarea/); // tema-ok: busca la caja en el HTML renderizado
  });

  test("el aviso de privacidad es una sola línea", () => {
    assert.equal(html.match(/datos personales/g)?.length, 1);
  });
});

describe("desplegables del resultado", () => {
  test("«Así se ve en tu mensaje» es un desplegable", () => {
    const html = renderToStaticMarkup(
      <MensajeSenalado
        id="s"
        texto="Paga ya"
        fragmentos={[{ inicio: 0, fin: 4, nivel: "roja", codigo: "pide_dinero" }]}
      />,
    );
    assert.match(html, /<details[^>]*>\s*<summary[^>]*>[\s\S]*Así se ve en tu mensaje/);
  });

  test("«Ya lo han desmentido» va cerrado y con el número en el resumen", () => {
    const d = { editor: "Maldita.es", sitio: null, calificacion: "Falso", fecha: null };
    const html = renderToStaticMarkup(
      <Desmentidos
        id="d"
        veredicto="no_oficial"
        desmentidos={[
          { ...d, url: "https://maldita.es/a" },
          { ...d, url: "https://maldita.es/b" },
        ]}
      />,
    );
    assert.match(html, /<details(?![^>]*\bopen)[^>]*>\s*<summary[^>]*>[\s\S]*Ya lo han desmentido \(2\)/);
  });
});

// LAB-69 (2ª ronda): la caja del mensaje nunca pasa del 20 % del alto útil.
describe("caja del mensaje", () => {
  const html = renderToStaticMarkup(<AnalizarMensaje />);
  const caja = html.match(/<textarea[^>]*name="mensaje"[^>]*>/)?.[0] ?? ""; // tema-ok: busca la caja en el HTML renderizado

  test("su alto máximo es el 20 % de la pantalla menos la cabecera medida", () => {
    assert.match(caja, /max-h-\(--alto-caja\)/);
    assert.match(caja, /\[--alto-caja:calc\(\(100dvh_-_var\(--alto-cabecera,0px\)\)\*0\.2\)\]/);
  });

  test("unas 3 líneas como mínimo, salvo que no quepan en ese 20 %", () => {
    assert.match(caja, /min-h-\[min\(calc\(3lh_\+_1\.5rem_\+_2px\),var\(--alto-caja\)\)\]/);
  });

  test("sin alto fijo que lo contradiga", () => {
    assert.doesNotMatch(caja, /min-h-44|rows="6"/);
  });
});
