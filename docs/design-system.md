# Design system Import@ss

Sistema visual de Sello B tomado del portal Import@ss de la Tesorería General de la Seguridad Social: <https://portal.seg-social.gob.es/wps/portal/importass/importass/inicio>, consultado el 22/10/2026 con Playwright a 1440 y 375 px (capturas en `docs/evidencias/importass-inicio-1440.png` y `docs/evidencias/importass-inicio-375.png`). Los valores salen de los estilos calculados y de las variables CSS del tema «post» del portal, que es el que se ve hoy (petróleo `#046080`). El azul `#0129ae` es del tema anterior (`ss-components.css`) y ya no se ve en el portal.

Fuente de verdad: este documento y `src/styles/importass.css`. Cada token de las tablas existe en ese CSS con el mismo nombre y valor; `src/styles/importass.test.ts` lo comprueba, junto con el contraste de los pares documentados.

## Relación con Sol

Sol (`src/styles/tema.css`) sigue siendo la base de la plataforma y no se toca: lo protege `bun run lint:tema`. Import@ss es una capa aparte:

- Todos los tokens llevan el prefijo `--iss-`, así que no pisan los de Sol.
- Están en `src/styles/importass.css`, importado desde `globals.css` después de `tema.css`. Cada línea con color lleva su `tema-ok`.
- Tailwind los expone como utilidades: `bg-iss-primary-500`, `text-iss-text`, `border-iss-border-strong`, `rounded-iss-md`, `text-iss-body`, `max-w-iss-content`. Para los que no tienen utilidad, `text-(--iss-text-secondary)` o `var(--iss-…)`.
- Añadir este sistema no cambia ninguna página. Cada cambio de página sale después como issue de la review periódica.
- Lo que Sol ya resuelve y Import@ss no contradice (componentes de `src/components/ui`, sin modo oscuro, sin degradados ni sombras salvo en lo que flota) se mantiene.

## Principios

1. **Institucional y sobrio.** Fondo blanco, un solo color de marca (el petróleo) para acciones y enlaces, y nada decorativo que compita con el contenido.
2. **Primero se lee.** Texto de lectura a 18 px con interlineado 1,5. Columna de texto de 58rem como máximo y titulares en serif.
3. **El enlace es un enlace.** Siempre subrayado y en `--iss-primary-500`. El color nunca es la única pista.
4. **Una acción principal por pantalla.** Las demás son secundarias o enlaces.
5. **Accesible por defecto.** WCAG 2.2 AA: contraste, foco visible y objetivos táctiles de 48 px. Cuando Import@ss no llega a AA, el sistema corrige el valor y lo explica (ver «Desviaciones de Import@ss»).

## Color

### Primario

El petróleo de la Tesorería. El 500 es la acción y el enlace; los claros son fondos de hover y bordes decorativos; los oscuros son hover, activo, foco y pie.

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-primary-50` | `#edf9fc` | Fondo hover del botón secundario |
| `--iss-primary-100` | `#d8ebf2` | Fondo del botón terciario; borde decorativo de tarjeta |
| `--iss-primary-150` | `#b8dae5` | Fondo hover del botón terciario |
| `--iss-primary-200` | `#98c8d9` | Fondo activo del botón terciario |
| `--iss-primary-500` | `#046080` | Botón principal, enlace, titular de tarjeta enlazada |
| `--iss-primary-600` | `#034d66` | Enlace en hover |
| `--iss-primary-700` | `#02384a` | Botón principal en hover; anillo de foco |
| `--iss-primary-800` | `#022633` | Botón principal activo; fondo del pie |
| `--iss-primary-900` | `#01131a` | Franja final del pie |

### Superficies y texto

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-surface` | `#ffffff` | Fondo de página, tarjeta y campo |
| `--iss-surface-primary` | `#f2fafc` | Bloque destacado sobre blanco |
| `--iss-text` | `#030303` | Texto principal |
| `--iss-text-secondary` | `#595959` | Texto secundario, ayudas de campo |
| `--iss-text-inactive` | `#717879` | Texto inactivo o de apoyo (justo 4,5:1: no lo uses sobre fondos que no sean blancos) |
| `--iss-link-visited` | `#681da8` | Enlace visitado, solo en listas de recursos |
| `--iss-focus-glow` | `#4ec3cd` | Halo de foco de Import@ss (nunca solo: va con el anillo) |

### Neutros y bordes

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-neutral-50` | `#f2f2f2` | Fondo de banda neutra (cookies, avisos de página) |
| `--iss-neutral-100` | `#e5e5e5` | Fondo de control deshabilitado |
| `--iss-neutral-300` | `#b3b3b3` | Enlace del pie en hover |
| `--iss-border` | `#d5d5d5` | Separadores y líneas de tabla |
| `--iss-border-strong` | `#717879` | Borde de campo de formulario |
| `--iss-disabled-text` | `#ababab` | Texto de control deshabilitado |

### Estados

Cada estado tiene un fondo claro (50), un color de texto o borde sobre blanco (500/700) y un texto oscuro para escribir encima del fondo claro (850).

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-success-50` | `#e5f6f1` | Fondo de aviso de éxito |
| `--iss-success-700` | `#008057` | Icono, borde y texto corto de éxito |
| `--iss-success-850` | `#004d34` | Texto sobre `--iss-success-50` |
| `--iss-warning-50` | `#fff4e5` | Fondo de aviso de atención |
| `--iss-warning-500` | `#ff4d00` | Borde e icono de atención (no para texto) |
| `--iss-warning-700` | `#995600` | Texto corto de atención sobre blanco |
| `--iss-warning-850` | `#4d2b00` | Texto sobre `--iss-warning-50` |
| `--iss-error-50` | `#fee5ec` | Fondo de aviso de error |
| `--iss-error-500` | `#e50041` | Borde de campo con error, icono y mensaje de error |
| `--iss-error-700` | `#99002b` | Texto de error largo sobre blanco |
| `--iss-error-850` | `#4d0016` | Texto sobre `--iss-error-50` |
| `--iss-info-50` | `#e6f9ff` | Fondo de aviso informativo |
| `--iss-info-700` | `#057399` | Icono, borde y texto corto informativo |
| `--iss-info-850` | `#02394d` | Texto sobre `--iss-info-50` |

En Sello B, los veredictos se apoyan en estos estados: `no_oficial` usa error, `no_determinable` usa atención y `oficial_verificado` usa éxito. Siempre con texto e icono, nunca solo con color.

### Pares de contraste

Ratios WCAG 2.x calculados con los valores de arriba. «texto» exige 4,5:1; «grande» (desde 24 px, o 18,66 px en negrita) y «ui» (bordes, iconos, foco) exigen 3:1. La prueba recalcula cada fila.

<!-- pares-contraste -->

| Texto o elemento | Fondo | Ratio | Tipo | Dónde |
| --- | --- | --- | --- | --- |
| `--iss-text` | `--iss-surface` | 20.62:1 | texto | Texto de página |
| `--iss-text` | `--iss-surface-primary` | 19.50:1 | texto | Texto en bloque destacado |
| `--iss-text-secondary` | `--iss-surface` | 7.00:1 | texto | Ayudas y texto secundario |
| `--iss-text-inactive` | `--iss-surface` | 4.50:1 | texto | Texto de apoyo |
| `--iss-primary-500` | `--iss-surface` | 7.02:1 | texto | Enlace, botón secundario |
| `--iss-primary-600` | `--iss-surface` | 9.30:1 | texto | Enlace en hover |
| `--iss-primary-500` | `--iss-surface-primary` | 6.64:1 | texto | Enlace en bloque destacado |
| `--iss-primary-500` | `--iss-primary-50` | 6.54:1 | texto | Botón secundario en hover |
| `--iss-primary-500` | `--iss-primary-100` | 5.71:1 | texto | Botón terciario |
| `--iss-primary-700` | `--iss-primary-150` | 8.52:1 | texto | Botón terciario en hover |
| `--iss-link-visited` | `--iss-surface` | 9.01:1 | texto | Enlace visitado |
| `--iss-surface` | `--iss-primary-500` | 7.02:1 | texto | Botón principal |
| `--iss-surface` | `--iss-primary-700` | 12.60:1 | texto | Botón principal en hover |
| `--iss-surface` | `--iss-primary-800` | 15.82:1 | texto | Pie, botón activo |
| `--iss-surface` | `--iss-primary-900` | 18.93:1 | texto | Franja final del pie |
| `--iss-neutral-300` | `--iss-primary-800` | 7.54:1 | texto | Enlace del pie en hover |
| `--iss-error-500` | `--iss-surface` | 4.76:1 | texto | Mensaje de error de campo |
| `--iss-error-700` | `--iss-surface` | 8.79:1 | texto | Texto de error largo |
| `--iss-error-850` | `--iss-error-50` | 13.29:1 | texto | Aviso de error |
| `--iss-success-700` | `--iss-surface` | 4.97:1 | texto | Texto corto de éxito |
| `--iss-success-850` | `--iss-success-50` | 8.90:1 | texto | Aviso de éxito |
| `--iss-warning-700` | `--iss-surface` | 5.70:1 | texto | Texto corto de atención |
| `--iss-warning-850` | `--iss-warning-50` | 11.63:1 | texto | Aviso de atención |
| `--iss-info-700` | `--iss-surface` | 5.36:1 | texto | Texto corto informativo |
| `--iss-info-850` | `--iss-info-50` | 11.42:1 | texto | Aviso informativo |
| `--iss-border-strong` | `--iss-surface` | 4.50:1 | ui | Borde de campo |
| `--iss-primary-700` | `--iss-surface` | 12.60:1 | ui | Anillo de foco |
| `--iss-error-500` | `--iss-surface` | 4.76:1 | ui | Borde de campo con error |
| `--iss-warning-500` | `--iss-surface` | 3.33:1 | ui | Borde e icono de atención |
| `--iss-focus-glow` | `--iss-primary-800` | 7.54:1 | ui | Foco en el pie |

Pares que **no** cumplen y por eso tienen uso restringido:

- `--iss-primary-100` sobre blanco (1,23:1): solo borde decorativo de tarjeta, nunca el único límite de un control.
- `--iss-focus-glow` sobre blanco (2,10:1): solo como halo junto al anillo `--iss-focus-ring`.
- `--iss-disabled-text` sobre `--iss-neutral-100` (1,82:1): solo en controles deshabilitados, que WCAG exime.
- `--iss-warning-500` como texto (3,33:1): no; para texto, `--iss-warning-700` o `--iss-warning-850`.

## Tipografía

Import@ss usa Lato para el texto y Merriweather en negrita para los titulares. Ninguna de las dos se carga hoy en Sello B: si se adoptan, se sirven con `next/font` en `src/app/layout.tsx` (único sitio donde `lint:tema` permite fuentes). Mientras tanto se ven las alternativas de la pila.

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-font-body` | `Lato, "Helvetica Neue", Arial, sans-serif` | Texto, botones, campos, menús |
| `--iss-font-heading` | `Merriweather, Georgia, serif` | `h1` a `h4` |
| `--iss-text-h1` | `2rem` | `h1` (32 px, también en móvil) |
| `--iss-text-h2` | `1.75rem` | `h2` (28 px) |
| `--iss-text-h2-mobile` | `1.5rem` | `h2` por debajo de 45rem (24 px) |
| `--iss-text-h3` | `1.5rem` | `h3`, título de enlace de servicio (24 px) |
| `--iss-text-h3-mobile` | `1.25rem` | `h3` por debajo de 45rem (20 px) |
| `--iss-text-h4` | `1.25rem` | `h4`, titular de tarjeta (20 px) |
| `--iss-text-body` | `1.125rem` | Texto de lectura (18 px) |
| `--iss-text-sm` | `1rem` | Campos, avisos, pie, móvil (16 px) |
| `--iss-text-xs` | `0.875rem` | Texto de tabla y mensaje de error (14 px), nunca párrafos |
| `--iss-leading-heading` | `1.25` | Titulares (32/40, 28/35, 24/30, 20/25) |
| `--iss-leading-body` | `1.5` | Texto (18/27, 16/24) |
| `--iss-weight-regular` | `400` | Texto |
| `--iss-weight-bold` | `700` | Titulares, botones, etiquetas de campo |

Reglas:

- Titulares en `--iss-font-heading` y `--iss-weight-bold`; todo lo demás en `--iss-font-body`.
- Texto de lectura a 18 px en escritorio y 16 px en móvil. Nada de párrafos por debajo de 16 px.
- Un solo `h1` por página. No saltes niveles para conseguir un tamaño.

## Espaciado

Escala de 4 px. Import@ss usa sobre todo 8, 16, 24, 32, 48 y 64.

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-space-1` | `0.25rem` | Separación icono-texto |
| `--iss-space-2` | `0.5rem` | Titular de tarjeta a texto; ayuda de campo |
| `--iss-space-3` | `0.75rem` | Relleno vertical de aviso |
| `--iss-space-4` | `1rem` | Relleno de tarjeta y cabecera; entre etiqueta y campo |
| `--iss-space-6` | `1.5rem` | Relleno horizontal de botón; margen lateral en móvil |
| `--iss-space-8` | `2rem` | Entre secciones cortas; margen lateral desde 45rem |
| `--iss-space-12` | `3rem` | Relleno superior de cabecera de sección |
| `--iss-space-16` | `4rem` | Entre bloques de página; relleno del pie |

## Rejilla y breakpoints

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-container-page` | `64rem` | Ancho máximo de cabecera, cabecera de sección y pie (1024 px) |
| `--iss-container-content` | `58rem` | Ancho máximo de la columna de texto (928 px, 864 px de texto) |
| `--iss-gutter` | `1.5rem` | Margen lateral por debajo de 45rem |
| `--iss-gutter-md` | `2rem` | Margen lateral desde 45rem |
| `--iss-control-height` | `3rem` | Alto mínimo de botón y campo (Import@ss: 51 px) |

Breakpoints (los de Import@ss, que coinciden con los de Tailwind salvo el primero):

| Nombre | Desde | Qué cambia |
| --- | --- | --- |
| móvil | 0 | Una columna, márgenes de `--iss-gutter`, `h2`/`h3` en tamaño móvil, botones a todo el ancho |
| `sm` (Import@ss 31.25rem) | 500 px | Botones vuelven a su ancho |
| `md` (Import@ss 45rem) | 720 px | Márgenes de `--iss-gutter-md`, titulares a tamaño completo, servicios en dos columnas |
| `lg` (Import@ss 64rem) | 1024 px | Tarjetas en tres columnas; el contenedor llega a su máximo |

Sin scroll horizontal a 320 px.

## Radios y sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-radius-sm` | `0.25rem` | Avisos, botón de buscar, chips |
| `--iss-radius-md` | `0.5rem` | Botones, campos y tarjetas |
| `--iss-radius-lg` | `1rem` | Cabecera de sección (hero) |

Import@ss no usa sombras para dar profundidad: separa con bordes y fondos. La única «sombra» es el halo de foco. La cabecera de inicio lleva un degradado y una sombra interior decorativos que **no** se adoptan (AGENTS.md: sin degradados nuevos): la cabecera de sección es `--iss-primary-500` plano.

## Foco

| Token | Valor | Uso |
| --- | --- | --- |
| `--iss-focus-ring` | `3px solid var(--iss-primary-700)` | `outline` de todo elemento enfocable |
| `--iss-focus-offset` | `2px` | `outline-offset` |
| `--iss-focus-halo` | `0 0 4px 3px var(--iss-focus-glow)` | Halo opcional, solo junto al anillo |

Se aplica con `:focus-visible`, nunca con `:focus` a secas. Sobre fondos oscuros (pie, botón principal) el anillo pasa a `--iss-surface`.

## Componentes

Los componentes siguen siendo los de `src/components/ui` (y `Button`, `Input`, `Textarea`, `Card`, `Badge`): Import@ss da los valores, no componentes nuevos. Cada estado indica el token.

### Cabecera

- Ancho `--iss-container-page`, relleno `--iss-space-4`, alto 96 px, fondo `--iss-surface`, sin borde inferior.
- Izquierda: icono y nombre de `ficha.json` (sin escudos ni logotipos de la Administración). Derecha: como mucho un enlace de acción en `--iss-weight-bold`, subrayado, `--iss-primary-500`.
- Haz: deja la cabecera blanca y ligera. No hagas: menús desplegables o barras de color a todo el ancho.

### Cabecera de sección (hero)

- Fondo `--iss-primary-500`, texto `--iss-surface`, radio `--iss-radius-lg`, relleno `--iss-space-12` arriba y `--iss-space-16` abajo (en móvil `--iss-space-8` arriba y sin radio).
- `h1` centrado con `--iss-text-h1`, entradilla en `--iss-text-body`, y hasta dos botones en variante invertida (fondo `--iss-surface`, texto `--iss-primary-500`).
- No hagas: degradados, imágenes de fondo o más de dos botones.

### Botones

Comunes: `--iss-font-body`, `--iss-weight-bold`, `--iss-text-body`, relleno `0.625rem --iss-space-6`, alto mínimo `--iss-control-height`, ancho mínimo 15rem (en móvil, todo el ancho), borde de 2 px, radio `--iss-radius-md`, sin subrayado. Transición de 150 ms en color de fondo y borde, anulada con `prefers-reduced-motion`.

| Variante | Reposo | Hover | Activo | Deshabilitado |
| --- | --- | --- | --- | --- |
| Principal | fondo y borde `--iss-primary-500`, texto `--iss-surface` | fondo `--iss-primary-700` | fondo `--iss-primary-800` | fondo y borde `--iss-neutral-100`, texto `--iss-disabled-text` |
| Secundario | fondo `--iss-surface`, borde y texto `--iss-primary-500` | fondo `--iss-primary-50`, borde y texto `--iss-primary-700` | fondo `--iss-primary-100` | igual que principal |
| Terciario | fondo y borde `--iss-primary-100`, texto `--iss-primary-500` | fondo `--iss-primary-150`, texto `--iss-primary-700` | fondo y borde `--iss-primary-200` | igual que principal |
| Invertido (sobre hero) | fondo y borde `--iss-surface`, texto `--iss-primary-500` | fondo `--iss-primary-50` | fondo `--iss-primary-100` | — |

Foco: `--iss-focus-ring` con `--iss-focus-offset` en todas.

- Haz: una sola principal por pantalla; verbo + objeto («Comprobar mensaje»). Un enlace con aspecto de botón es un `<a>` con las clases del botón.
- No hagas: botones con solo icono sin `aria-label`; texto en mayúsculas; deshabilitar el botón de enviar para indicar errores (mejor mostrar el error).

### Enlaces

- Color `--iss-primary-500`, siempre subrayados. Hover: `--iss-primary-600` y subrayado de 2 px. Activo: `--iss-primary-800`. Visitado: `--iss-link-visited` solo en listas de recursos.
- Foco: `--iss-focus-ring`. El área clicable mínima es 24 × 24 px (WCAG 2.5.8); en listas, relleno vertical para llegar a 44 px.
- Enlace externo: icono de salida detrás del texto y «(se abre en otra web)» para lectores de pantalla.
- Enlace de servicio: titular en `--iss-font-heading`, `--iss-text-h3`, `--iss-weight-bold`, subrayado, con una línea de descripción debajo en `--iss-text-body`.
- En Sello B, las URL analizadas **no** son enlaces: se muestran neutralizadas y en texto plano. El único enlace es la web oficial.

### Campos de formulario y errores

- Etiqueta visible encima (`<label>`), `--iss-weight-bold`, `--iss-text-body`. Ayuda debajo de la etiqueta, `--iss-text-sm`, `--iss-text-secondary`, unida con `aria-describedby`.
- Campo: fondo `--iss-surface`, texto `--iss-text`, borde 1 px `--iss-border-strong`, radio `--iss-radius-md`, alto mínimo `--iss-control-height`, relleno `0.6875rem --iss-space-4`, `--iss-text-sm` (16 px para que iOS no haga zoom).
- Hover: borde `--iss-primary-500`. Foco: borde `--iss-primary-500` y `--iss-focus-ring`. Deshabilitado: fondo `--iss-neutral-100`, texto `--iss-disabled-text`, borde `--iss-neutral-100`.
- Error: borde 2 px `--iss-error-500`, `aria-invalid="true"`, mensaje debajo en `--iss-error-500` con icono, enlazado con `aria-describedby`. El mensaje dice qué pasa y cómo arreglarlo («Pega el mensaje que has recibido»).
- No hagas: el placeholder como etiqueta; errores solo en rojo sin texto; borrar lo escrito al fallar.

### Tarjetas

- **Tarjeta de enlace** («Especial sobre…»): fondo `--iss-surface`, borde 1 px `--iss-primary-100`, radio `--iss-radius-md`, relleno `--iss-space-4`. Titular en `--iss-font-heading`, `--iss-text-h4`, `--iss-primary-500`. Toda la tarjeta es el enlace; hover: fondo `--iss-primary-50` y titular subrayado; foco: `--iss-focus-ring`.
- **Tarjeta destacada**: fondo `--iss-primary-500`, texto `--iss-surface`, radio `--iss-radius-md`, relleno `--iss-space-6 --iss-space-4`; enlace interior en `--iss-surface`, subrayado. Una por vista como mucho.
- **Bloque destacado**: fondo `--iss-surface-primary`, sin borde, para el dato que más importa.
- No hagas: sombras; tarjetas anidadas; más de un enlace por tarjeta de enlace.

### Avisos

- Relleno `--iss-space-3 --iss-space-4`, borde 1 px, radio `--iss-radius-sm`, `--iss-text-sm`, icono a la izquierda y título en negrita.

| Tipo | Fondo | Borde e icono | Texto |
| --- | --- | --- | --- |
| Informativo | `--iss-info-50` | `--iss-info-700` | `--iss-info-850` |
| Éxito | `--iss-success-50` | `--iss-success-700` | `--iss-success-850` |
| Atención | `--iss-warning-50` | `--iss-warning-500` | `--iss-warning-850` |
| Error | `--iss-error-50` | `--iss-error-500` | `--iss-error-850` |

- Los que aparecen tras una acción van en una región `role="status"` (o `role="alert"` si es un error que bloquea).
- No hagas: avisos que se cierran solos; solo color sin icono ni título.

### Tablas

- Ancho completo, `border-collapse`, `<caption>` alineado a la izquierda con relleno `--iss-space-4 --iss-space-6`.
- Cabecera `<th scope="col">` en `--iss-weight-bold`, `--iss-text-sm`, fondo `--iss-neutral-50`; celdas en `--iss-text-sm` (Import@ss usa 14 px; aquí 16 px para personas mayores), separadas por 1 px `--iss-border`.
- En móvil, cada fila pasa a bloque con su etiqueta o la tabla va en un contenedor con scroll propio y `tabindex="0"`; nunca scroll horizontal de la página.

### Pasos

Import@ss no publica un componente de pasos en esta página; se define con sus tokens:

- Lista ordenada (`<ol>`), número en un círculo de 2rem con borde 2 px `--iss-primary-500` y texto `--iss-primary-500` en `--iss-weight-bold`.
- Paso actual: círculo con fondo `--iss-primary-500` y número `--iss-surface`, `aria-current="step"`. Paso hecho: icono de check y texto «(hecho)» oculto para lectores. Paso pendiente: borde `--iss-border-strong`, número `--iss-text-secondary`.
- Titular del paso en `--iss-weight-bold`, `--iss-text-body`; descripción en `--iss-text-body`.

### Pie

- Bloque superior: fondo `--iss-primary-800`, texto `--iss-surface`, relleno `--iss-space-16` vertical. Titulares de columna en `--iss-font-heading`, `--iss-text-h3`. Enlaces en `--iss-surface`, `--iss-text-sm`, subrayados; hover `--iss-neutral-300`; foco con anillo `--iss-surface` y halo `--iss-focus-halo`.
- Franja final: fondo `--iss-primary-900`, enlaces legales en línea, `--iss-text-sm`.
- Se conservan el aviso «Herramienta experimental. No es un servicio oficial.» y `<BotonAviso />`. Sin escudo.

### Navegación y migas

- Migas: ancho `--iss-container-page`, relleno `--iss-space-3 --iss-space-6`, borde inferior 1 px `--iss-border`, `--iss-text-sm`. En móvil solo se ve el nivel anterior («‹ Volver a …»). `<nav aria-label="Migas de pan">`, último nivel con `aria-current="page"` y sin enlace.

## Accesibilidad (WCAG 2.2 AA)

- **Contraste**: texto 4,5:1 y texto grande 3:1 (1.4.3); bordes de control, iconos y foco 3:1 (1.4.11). Solo los pares de la tabla «Pares de contraste».
- **Foco visible** (2.4.7) y **no tapado** (2.4.11): `--iss-focus-ring` en todo lo enfocable; nada fijo encima del elemento enfocado.
- **Objetivos táctiles** (2.5.8): mínimo 24 × 24 px; botones y campos a `--iss-control-height` (48 px).
- **Color** (1.4.1): enlaces subrayados; estados con icono y texto.
- **Reflujo** (1.4.10): sin scroll horizontal a 320 px. **Texto** (1.4.4/1.4.12): todo en `rem`, aguanta 200 % y espaciado de texto aumentado.
- **Formularios** (3.3.1, 3.3.2, 3.3.7): etiqueta visible, error en texto junto al campo, no pedir dos veces lo mismo.
- **Movimiento**: transiciones cortas y anuladas con `prefers-reduced-motion` (ya está en `globals.css`).
- **Controles nativos**: `button`, `a`, `input`, `select`, `label` (y los de `src/components/ui`), nunca `div` clicables.

## Desviaciones de Import@ss

Donde Import@ss no llega a AA o choca con las reglas de la plataforma, el sistema se aparta a propósito:

| Import@ss | Este sistema | Por qué |
| --- | --- | --- |
| Borde de campo `#d8ebf2` (1,23:1) | `--iss-border-strong` (4,50:1) | 1.4.11: el límite de un control necesita 3:1 |
| Foco solo con halo `#4ec3cd` (2,10:1 sobre blanco) | `--iss-focus-ring` + halo opcional | 1.4.11 y 2.4.7 |
| Mensaje de error a 14 px | Igual (`--iss-text-xs`), pero con icono y en `--iss-error-500` | Legible y no solo color |
| Celdas de tabla a 14 px | 16 px (`--iss-text-sm`) | Público mayor; texto de lectura desde 16 px |
| Hero con degradado cónico y sombra interior | `--iss-primary-500` plano | AGENTS.md: sin degradados nuevos |
| Escudo y logotipos en cabecera y pie | Icono y nombre de `ficha.json` | Regla de la plataforma: sin logotipos de la Administración |

## Pendiente para la review periódica

Este PR solo añade el sistema. Lo que hoy no lo sigue (sale como issues aparte):

- `src/app/globals.css` define `--azul-importass` (`#0129ae`) y `--azul-importass-oscuro` (`#011865`), del tema antiguo de Import@ss, y `src/app/page.tsx` los usa en el pie. Deberían pasar a `--iss-primary-500` y `--iss-primary-700`, y luego borrarse.
- Las páginas usan las fuentes y colores de Sol: se decidirá página a página qué pasa a `--iss-*`.
