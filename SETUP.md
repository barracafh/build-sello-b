# Track 3 · Verificador de webs y mensajes

## El reto

Comprueba si una web, un SMS o un aviso es oficial de verdad y, si no lo es, te dice cuál es la buena. Antiphishing contra las estafas que suplantan a la DGT, a Hacienda y a otros organismos.

Puede haber hasta dos squads en este track, los dos con el mismo reto. Cada uno construye las piezas que le dé tiempo, en el orden que prefiera.

## Qué se espera en la demo

Pegar un mensaje o una URL y obtener un veredicto (`oficial_verificado`, `no_oficial` o `no_determinable`), el motivo y la web oficial correcta. Un dominio desconocido o un mensaje bien redactado, sin otra señal, salen `no_determinable`.

## Piezas

El reto se puede abordar por partes. Elegid las que os dé tiempo y en el orden que queráis.

| Pieza                       | Alcance en unas 4 h                                                                               | Hecho cuando…                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ¿Esta web es oficial?       | Comprobar una URL contra la lista de dominios oficiales, sin visitarla.                           | Distingue coincidencia exacta, subdominio válido y dominio desconocido; no equipara desconocido con fraude, muestra la URL analizada neutralizada y sin enlace, y da la web oficial correcta. |
| ¿Este mensaje es de verdad? | Analizar un SMS o un correo pegado: remitente, enlaces y señales de fraude publicadas por INCIBE. | Acierta el resultado `esperado` de los 10 casos de `mensajes-ejemplo.json`, explica el motivo y, ante la duda, remite a la web oficial y al 017.                                              |

## Materiales (`datos/`)

- `dominios-oficiales.json`
  - 25 entidades (AEAT, DGT, Seguridad Social, SEPE, Correos, INCIBE, Cl@ve, DEHú, GVA, Ajuntament de València, etc.) con sus dominios oficiales y la fuente de cada uno.
  - La regla `*.gob.es`: este dominio está reservado a las Administraciones Públicas españolas (Orden ITC/1542/2005).
- `mensajes-ejemplo.json`: 10 casos de prueba, cada uno con `esperado` (`oficial_verificado`, `no_oficial` o `no_determinable`), `pistas` y `web_oficial_correcta`.
  - 5 fraudes reales, con el texto literal publicado por INCIBE (AEAT, DGT por SMS y por email, Correos y Seguridad Social). INCIBE no publica las URL maliciosas, así que cada uno incluye una `url_prueba_sintetica` inventada y neutralizada (`hxxps://…[.]top`, `[.]com`…). Los cinco salen `no_oficial`.
  - 5 casos legítimos de redacción propia, basados en el formato que describe la fuente oficial. Los 4 avisos sin enlace salen `no_determinable`: el texto encaja con un aviso oficial, pero no prueba quién lo envía, así que la herramienta remite a la sede. Solo la web de la lista (L05) sale `oficial_verificado`.

## Fuentes

| Fuente                                                                        | Qué ofrece                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [INCIBE · Avisos a la ciudadanía](https://www.incibe.es/ciudadania/avisos)    | Campañas activas de phishing y smishing                                                                                                                                                                                                                                                                                                                           |
| [Línea 017 de INCIBE](https://www.incibe.es/linea-de-ayuda-en-ciberseguridad) | Ayuda gratuita y confidencial en ciberseguridad, de 8:00 a 23:00 los 365 días; también por WhatsApp (900 116 117) y Telegram (@INCIBE017)                                                                                                                                                                                                                         |
| [Google Safe Browsing](https://developers.google.com/safe-browsing)           | Reputación de URL, opcional. Clave gratuita, solo para uso no comercial. La v4 está obsoleta: hay que usar la v5, que exige avisos claros al usuario y atribuir el resultado a Google. En la versión publicada, la clave está en `SAFE_BROWSING_API_KEY`; sin clave (por ejemplo, en local), la herramienta dice «reputación no consultada» y sigue con la lista. |
| RDAP (`https://rdap.org/domain/<dominio>`)                                    | Fecha de registro y titular del dominio. rdap.org responde con una redirección (302) al registro de cada dominio de primer nivel y no cubre `.es` (404). Sin dato, la herramienta dice «no disponible» y no lo toma como señal de fraude.                                                                                                                         |

## A tener en cuenta

- El peor error es decir «oficial» de algo que no lo es. Ante la duda, la respuesta es «no puedo confirmarlo; entra tú por la web oficial».
- Ojo con las trampas de dominio: `dgt.es.multas-pago[.]com` no es `dgt.es`.
- Las URL sospechosas no se abren ni se descargan, y la herramienta no sigue sus redirecciones, no expande sus acortadores ni se conecta a ellas: solo analiza el texto de la URL. Un acortador sale `no_determinable`.
- La URL analizada se muestra como texto y neutralizada (`hxxps://ejemplo[.]com`), nunca como enlace. El único enlace clicable es la web oficial de la lista.
- No se guarda lo que pega el ciudadano: ni base de datos ni logs con su texto.
- Cada entidad de la lista lleva en `fuente` la página que respalda sus dominios, consultada el 17 o el 18/10/2026. Algunos dominios se confirmaron solo con un resultado de búsqueda (lo explica `notas`): revisadlos antes de usarlos fuera de la demo.

## Resumen para el agente

```markdown
# Track 3 · Verificador de webs y mensajes · Build night · BARRACA x SOTI

Objetivo: a partir de un SMS, un email o una URL que dice ser de un organismo público, dar un veredicto (oficial_verificado, no_oficial o no_determinable), el motivo y la web oficial correcta.
Datos: datos/dominios-oficiales.json (lista blanca + regla \*.gob.es) y datos/mensajes-ejemplo.json (10 casos de prueba con el resultado esperado).
Fuentes: avisos de INCIBE, Google Safe Browsing v5 (opcional, clave en SAFE_BROWSING_API_KEY; sin ella, "reputación no consultada") y RDAP (sin datos de .es: "no disponible").
Reglas: ante la duda, no_determinable y "no puedo confirmarlo"; un texto bien redactado no prueba quién envía el mensaje; no abrir, seguir, expandir ni conectar con las URL analizadas, y mostrarlas neutralizadas y sin enlace; recomendar la línea 017 de INCIBE en casos sospechosos; no guardar datos del usuario; claves solo en servidor; la herramienta se sirve bajo /<equipo> (campo `equipo` de ficha.json) y muestra el aviso "No es un servicio oficial".
```
