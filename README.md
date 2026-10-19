# Tu herramienta, lista para empezar

Plantilla de cada equipo: Next.js y Tailwind, con rutas de servidor para llamar a la IA. La organización crea un repo por equipo a partir de esta carpeta, con los datos de su track, y lo conecta a su proyecto de Vercel. Este directorio tiene su propio `package.json` y `bun.lock`; no depende del workspace del evento.

Las reglas y el contexto para vuestro asistente de IA están en [AGENTS.md](AGENTS.md); el reto del track, en `SETUP.md`.

## Arrancar

Con Bun y Node 22 o superior, dentro del repo de vuestro equipo:

```sh
bun install --frozen-lockfile
bun run dev
```

Abre `http://localhost:3000/<equipo>`, con el `equipo` de `ficha.json`. Cambia el ejemplo en `src/app/page.tsx`; los metadatos salen de `ficha.json`.

- Pon `<Fuentes fuentes={[{ nombre: "Fuente oficial", url: "https://www.boe.es/" }]} />` debajo de **cada respuesta**. Cita la página concreta que sostiene la respuesta.
- Conserva el aviso de no oficial y `<BotonAviso />`, que abre un issue en vuestro repo.
- La IA se llama desde el servidor con `src/lib/ia.ts`; hay un ejemplo en `src/app/api/ia/route.ts`. Las claves van en `.env.local` y nunca en el código ni en variables `NEXT_PUBLIC_*`.

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
