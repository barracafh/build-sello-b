# Tu herramienta, lista para empezar

Plantilla de cada equipo: Next.js y Tailwind, con rutas de servidor para llamar a la IA. La organización crea un repo por equipo a partir de esta carpeta, con los datos de su track, y lo conecta a su proyecto de Vercel. Este directorio tiene su propio `package.json` y `bun.lock`; no depende del workspace del evento.

Las reglas y el contexto para vuestro asistente de IA están en [AGENTS.md](AGENTS.md); el reto del track, en `SETUP.md`.

## Arrancar

Con Bun y Node 22 o superior, dentro del repo de vuestro equipo:

```sh
bun install --frozen-lockfile
bun run dev
```

`bun run dev` imprime la URL en la que sirve, por ejemplo `http://localhost:3142/sello-b`, con el `equipo` de `ficha.json`. Cambia el ejemplo en `src/app/page.tsx`; los metadatos salen de `ficha.json`.

- Pon `<Fuentes fuentes={[{ nombre: "Fuente oficial", url: "https://www.boe.es/" }]} />` debajo de **cada respuesta**. Cita la página concreta que sostiene la respuesta.
- Conserva el aviso de no oficial y `<BotonAviso />`, que abre un issue en vuestro repo.
- La IA se llama desde el servidor con `src/lib/ia.ts`; hay un ejemplo en `src/app/api/ia/route.ts`. Las claves van en `.env.local` y nunca en el código ni en variables `NEXT_PUBLIC_*`.

## Varios worktrees a la vez

Cada worktree del repo puede tener su propio servidor de desarrollo al mismo tiempo, sin chocar con los demás:

- **Puerto.** `bun run dev` (`scripts/dev.ts`) saca un puerto fijo entre 3100 y 3199 a partir de la ruta del worktree; si está ocupado, toma el siguiente libre del rango. El 3000 queda libre para otras cosas. `PORT=4000 bun run dev` lo fija a mano y siempre gana.
- **URL.** Al arrancar imprime `http://localhost:<puerto>/<equipo>`, ya con la ruta del equipo.
- **Nada compartido.** Cada worktree tiene su `.next`, su `tsconfig.tsbuildinfo`, su `.env.local` (fuera de git; cópialo a mano en cada worktree) y su `node_modules`. Ejecuta `bun install --frozen-lockfile` en cada uno: Bun enlaza los paquetes desde su caché global, que es de solo lectura, así que la instalación es rápida y segura.

```sh
git worktree add ../sello-b-otra -b mi-rama
cd ../sello-b-otra
cp ../build-sello-b/.env.local .   # si lo tienes
bun install --frozen-lockfile
bun run dev
```

**Preview en Tailscale.** Si `tailscale` está disponible, `bun run dev` publica el puerto con `tailscale serve --bg --https=<puerto>` y imprime `Preview: https://<host>.ts.net:<puerto>/<equipo>` bajo la URL local. Es solo para la tailnet (nunca `funnel`) y no toca las rutas del 443. La base sale de `PREVIEW_BASE_URL` si está puesta, o si no de `Self.DNSName` de `tailscale status --json`; sin Tailscale, dev funciona como siempre y no imprime preview. `next.config.ts` añade ese host a `allowedDevOrigins` para que el hot reload funcione. Al salir (Ctrl+C, SIGTERM, caída) el script retira solo su entrada. Un `kill -9` no se puede interceptar y deja la entrada: `tailscale serve --https=<puerto> off`. Publica después de que next escuche, porque `tailscale serve` ocupa el puerto.

`bun run test` prueba la elección de puerto y el preview. Vercel no usa nada de esto: sigue con `bun run build`.

## Publicar

Cada push a `main` se publica solo en `https://build.barraca.house/<equipo>`. No hace falta entrar en Vercel: las claves ya están puestas en el proyecto. Si `bun run build` falla en local, tampoco se publicará.

## CLI del evento

`buildnight` revisa las seis reglas, entrega la ficha y enseña el tablón. Necesita `gh auth login`. En macOS o Linux:

```sh
curl -fsSL https://build.barraca.house/instalar.sh | sh
buildnight                          # vuestro expediente: equipo, track y cuenta atrás
buildnight observar                 # déjalo abierto: suma vuestros tokens al ranking
```

`observar` cuenta los tokens de Claude Code, Codex y Pi en este proyecto durante el build. La primera vez te pide confirmar tu cuenta en GitHub; no da acceso a nada.

En Windows, descarga `buildnight-windows-x64.exe` de la [última release](https://github.com/barracafh/build-comite/releases/latest).

## Ficha y entrega

`ficha.json` describe la herramienta: nombre, frase, icono, track (`herramienta`), equipo, URL pública y fuentes. `datos` indica `simulados` o datos públicos `reales`, nunca personales. No cambiéis `equipo`: de él sale la ruta.

```sh
git add .
buildnight ficha validar
buildnight revisar
```

Hasta que la herramienta esté publicada, la regla de URL pública fallará; las otras cinco deben pasar. La revisión analiza archivos versionados; no acredita la exactitud del contenido. Incluid en vuestro README media página con problema, usuario, qué habéis hecho y qué falta para producción. Entregad con `buildnight registrar`.

El contrato es `apps/cli/esquemas/ficha.schema.json` en el monorepo del evento. Conservad `.buildnight/plantilla.json`.

## Diseño

Todas las herramientas usan Sol, el sistema visual de [Reforma Digital](https://reforma-digital.es), con el OK de Samu: los tokens de `src/styles/tema.css`, Geist y Geist Mono servidas por `next/font` desde el propio sitio, Georgia en los titulares y las primitivas de shadcn/ui con Base UI de `src/components/ui/`. `src/app/page.tsx` enseña cómo se compone una respuesta. Las reglas están en [AGENTS.md](AGENTS.md#diseño); el origen y la licencia, en [AVISO.md](AVISO.md).

Para añadir componentes: `bunx shadcn@4.22.1 add <componente>`. Responded **no** si pide sobrescribir componentes existentes, para conservar variantes como `sunset`. No uséis `--overwrite` ni `shadcn init`. Subid también los cambios de `package.json` y `bun.lock`.

Referencias: [basePath de Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), [Tailwind con Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs) y [shadcn/ui con Base UI](https://ui.shadcn.com/docs).

Hello! 👋

## Verificador de enlaces (sello-b)

**Problema.** Llegan SMS y correos que suplantan a la DGT, Hacienda, la Seguridad Social o Correos. **Usuario:** cualquier persona que duda antes de pulsar un enlace.

**Qué hay.** Pegas un mensaje o una URL y `POST /api/verificar` devuelve `oficial_verificado`, `no_oficial` o `no_determinable`, los motivos y la web oficial buena. Es determinista, sin IA y sin red (`src/lib/verificar.ts`, apartado 5.2 de `contexto.md`):

- Extrae enlaces con esquema, neutralizados (`hxxps`, `[.]`) y dominios sueltos. Nunca los abre, sigue ni expande; se muestran neutralizados y sin enlace.
- Rechaza IP y credenciales en la URL, detecta homógrafos (esqueleto de confundibles cirílicos y griegos), calcula el dominio registrable con la Public Suffix List (`tldts`), trata las plataformas compartidas de sedes y compara con `datos/dominios-oficiales.json` por etiquetas completas.
- Imitación de marca solo concluye con una segunda señal (TLD barato o palabra de contenido); los dominios que un organismo ha publicado como fraude están en `src/datos/indicadores.ts`.
- Un correo remitente con el nombre de un organismo y otro dominio es `no_oficial`; uno del dominio oficial no prueba nada.
- Un dominio desconocido o un texto bien redactado salen `no_determinable`. Los 10 casos de `datos/mensajes-ejemplo.json` y la tabla 5.3 sin red se prueban con `bun run test`.

**Qué falta para producción.** Google Safe Browsing y RDAP (hoy «no consultada» y «no disponible»), DNS para distinguir un `.gob.es` real de uno inventado, la comprobación TLS, la lista de inquilinos de plataformas municipales (04b), el feed de INCIBE en vez de la copia manual de indicadores y el alias del remitente (Registro de Alias de la CNMC).
