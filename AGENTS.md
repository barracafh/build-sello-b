# Build night · BARRACA x SOTI

Este repo es la herramienta de un equipo para la plataforma de atención ciudadana del Build night (jueves 22 de octubre de 2026, València). Antes de escribir código, lee `SETUP.md`: el reto del track, la demo esperada, los riesgos y los archivos de `datos/`. `contexto.md` es el marco de conocimiento verificado del track; es largo, así que busca en él en vez de leerlo entero. Lo completan los ficheros de `comun/` (territorio, competencias y, en algunos tracks, gestores de expedientes), que `contexto.md` cita por su código: 00, 00b y 04b.

## Cómo está montado

- Next.js (App Router) y Tailwind, con Bun: `bun install`, `bun run dev`, `bun run build`.
- La app vive en `/<equipo>`, el campo `equipo` de `ficha.json`: en local, `http://localhost:3000/<equipo>`; publicada, `https://build.barraca.house/<equipo>`. No cambies `equipo`: de él salen la ruta y el sitio en la plataforma.
- `<Link>` añade esa ruta solo. Para `fetch` e imágenes de `public/`, también con `next/image`, usa `ruta()` de `src/config/sitio.ts`: `fetch(ruta("/api/ia"))` y `<Image src={ruta("/foto.png")} ... />`.
- Cada push a `main` se publica solo. Trabajad sobre `main`, con `git pull --rebase` antes de cada push: las ramas no tienen vista previa que podáis abrir.
- `bun run build` tiene que pasar antes de cada push. Si falla, no se publica.

## IA y claves

- La IA es de HelmCode, compatible con la API de OpenAI. `src/lib/ia.ts` la llama y `src/app/api/ia/route.ts` es un ejemplo completo.
- El modelo es `glm5.3-flash` (`HELMCODE_MODEL`) y lee también imágenes: manda `content` como lista de partes, `[{ type: "text", text }, { type: "image_url", image_url: { url: "data:image/jpeg;base64,…" } }]`. Para un PDF con texto, extrae el texto en el servidor y manda solo eso.
- Todos los equipos comparten los límites de HelmCode. `completar()` reintenta cuando responde 429, pero no la llames en bucle ni una vez por cada tecla.
- Llámala solo desde el servidor: rutas de `src/app/api/` o Server Actions. Ninguna clave lleva el prefijo `NEXT_PUBLIC_`.
- En local, las claves van en `.env.local`, que nunca se sube: `HELMCODE_API_KEY`, `HELMCODE_MODEL` y, si os la dan, `HELMCODE_BASE_URL`. Sello usa además `SAFE_BROWSING_API_KEY` y ¿Cómo voto?, `FACTCHECK_API_KEY`. En la versión publicada ya están puestas.

## Diseño

Todas las herramientas de la plataforma usan Sol, el sistema visual de Reforma Digital, y deben verse como una sola web.

- Los tokens están en `src/styles/tema.css`. No cambies sus valores ni añadas colores, fuentes, radios o sombras. Fondo blanco, texto `text-foreground` y secundario `text-(--text-secondary)`.
- Los componentes, en `src/components/ui/` (shadcn/ui con Base UI): `Button`, `Card`, `Badge`, `Input` y `Textarea`. Úsalos con sus variantes y tamaños; las clases que añadas son de composición. Para más piezas, `bunx shadcn@4.22.1 add <componente>`, ya configurado en `components.json`. Responde **no** si pide sobrescribir componentes existentes: `Button` tiene la variante propia `sunset`. No uses `--overwrite` ni `shadcn init`. Sube también los cambios de `package.json` y `bun.lock`.
- Tipografía: la serif (`font-heading`, peso normal) solo en `h1`, `h2` y cifras grandes; Geist en todo lo demás, también botones y menús; `font-mono` para datos, URLs y etiquetas cortas en mayúsculas. Texto de lectura desde 16 px.
- Color: el rojo `brand` es un acento (números de paso, icono), no un color de botón ni de texto largo. Una acción principal por pantalla, `Button` con `variant="sunset"`; el resto, `outline` o `secondary`. Un enlace con aspecto de botón es `<a className={buttonVariants({ variant: "sunset" })}>`, no un `Button`. Una sola tarjeta con el sol (amarillo) por vista: la del dato que más importa.
- Respuestas: compón como `src/app/page.tsx`: la pregunta como titular, pasos numerados, tarjetas para requisitos, plazos o coste, «Dónde se hace» con el enlace a la sede y `<Fuentes />`.
- Sin modo oscuro, sin degradados nuevos y sin sombras salvo en lo que flota. Sin logotipos de Reforma Digital ni de la Administración: cada herramienta se presenta con el icono y el nombre de `ficha.json`.
- Contraste AA, foco visible, controles nativos (`button`, `select`, `input`, `label`) y `prefers-reduced-motion`. Sin scroll horizontal a 320 px.

## Reglas de la plataforma

1. Cada respuesta cita su fuente oficial con `<Fuentes />`, enlazando la página concreta que la sostiene.
2. Nada de datos personales reales: ni DNI, ni expedientes, ni contraseñas. Se simulan.
3. No se guarda lo que escribe el ciudadano: ni base de datos ni logs con su texto.
4. Ante la duda, la herramienta dice que no puede confirmarlo y enlaza la sede oficial. Nunca inventa importes, plazos ni requisitos.
5. Se conservan el aviso «Herramienta experimental. No es un servicio oficial.» y el botón «¿Algo está mal? Avísanos».
6. `ficha.json` describe la herramienta: nombre, frase, icono, fuentes y `datos` (`simulados`, o `reales` si son datos públicos).
7. `datos/`, `comun/`, `contexto.md` y `SETUP.md` son material de la organización: no los editéis. Vuestros datos van en otra carpeta, por ejemplo `src/datos/`.
