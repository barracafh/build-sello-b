## Conjunto de evaluación del clasificador

50 casos curados a mano para evaluar el veredicto de Sello: 35 de desarrollo (`dev.json`, en el repo) y 15 de prueba que no se suben nunca. `bun run eval` (LAB-39) carga solo `dev.json`. `dev.test.ts` comprueba el esquema, el reparto, que no haya datos personales con aspecto real y que los casos `oficial_verificado` pasen el verificador determinista.

## Formato

Una lista de objetos con estos campos:

| Campo             | Valor                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `id`              | `dev-NN` (los de prueba usan otro prefijo; no se repiten)                                                                |
| `texto`           | El mensaje tal como lo pegaría el ciudadano. Las URL van sin neutralizar: la app lo hace                                 |
| `esperado`        | `oficial_verificado`, `no_oficial` o `no_determinable`                                                                   |
| `motivo_esperado` | Por qué, con el apartado de `contexto.md` que lo sostiene                                                                |
| `fuente`          | `repo:mensajes-ejemplo:<id>`, `contexto.md §x.y`, `spaphish:<hash>` o `hf:spam_ham_spanish:<split>:<fila>`               |
| `sintetico`       | `false` si el texto sale de la fuente (recortado o anonimizado); `true` si se ha escrito aquí a partir de ella           |
| `canal`           | `sms` o `email`; `web` solo en L05, que en el repo es una página y no un mensaje                                         |
| `etiqueta_origen` | La etiqueta de la fuente: el veredicto del repo, `phishing`/`legitimo` (SpaPhish) o `spam`/`ham` (spam_ham_spanish)      |

Las filas de spam_ham_spanish se cuentan desde 1 sin la cabecera.

## Fuentes y licencias

| Fuente                                                                                                                       | Licencia                                         | Uso                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Este repo: `datos/mensajes-ejemplo.json` y `contexto.md` §4.4, §4.5 y §5.3                                                   | Material de la organización                      | Los 10 mensajes de ejemplo, las filas de §5.3 y los fraudes publicados. Conservan su veredicto                       |
| [SpaPhish](https://data.mendeley.com/datasets/hz2d6gz7pc/2) (Bustio-Martínez et al., Mendeley Data, `Spaphish dataset - DiB.csv`) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Extractos recortados y anonimizados de correos: asunto y párrafo con la señal. Las URL se han sustituido |
| [spam_ham_spanish](https://huggingface.co/datasets/softecapps/spam_ham_spanish) (softecapps, Hugging Face)                   | Apache-2.0                                       | Unos pocos SMS cortos, casi todos como negativos difíciles                                                           |

Cambios sobre las fuentes externas: recorte, anonimización, sustitución de URL y, en los casos `sintetico: true`, un mensaje nuevo escrito a partir de la fila citada. Los datos en bruto se descargaron fuera del repo y no se suben.

## Reglas de etiquetado

Se etiqueta según `contexto.md`, no según la etiqueta de origen. Ante la duda, `no_determinable`.

- `oficial_verificado`: solo si el mensaje lleva un enlace (con esquema) a un host de la allowlist que el verificador determinista da por oficial (§1.1, §5.2). Un mensaje legítimo sin ese enlace es `no_determinable`, aunque cite la sede en el texto.
- `no_oficial`: solo con una señal concluyente: indicador publicado, imitación de un dominio oficial (homógrafo, marca como subdominio, credenciales en la URL, marca con TLD barato) o una regla de contenido de §5.4 y §5.6 (pago o datos bancarios en nombre de AEAT, DGT, Seguridad Social, SEPE o Correos; multa con QR; Cl@ve con correo; remitente con el nombre del servicio y otro dominio; amenaza de publicación en 72 h).
- `no_determinable`: el resto. Un phishing de un banco o de una empresa privada sin ninguna de esas señales queda aquí: §5.4 no tiene regla general para ellos.
- Los casos del repo conservan su veredicto. Las filas de §5.3 que solo son una URL van dentro de un SMS o correo breve, con el mismo veredicto. Se omiten las filas «solo si el inquilino consta».

## URL y datos personales

- Las URL inventadas para este conjunto usan dominios reservados (`.example`, RFC 2606).
- Las filas «ilustrativo» de §5.3 pasan también a `.example`, con la misma trampa (`https://dgt.es@ejemplo.example/pago`).
- Se conservan tal cual las del repo: las `url_prueba_sintetica` de `mensajes-ejemplo.json`, los hosts no ilustrativos de §5.3 y los dominios fraudulentos publicados en §4.4 y §4.5 (`src/datos/indicadores.ts`). Ninguna de las `url_prueba_sintetica` resolvía en DNS el 22/10/2026.
- Excepción: un caso de acortador usa `bit.ly` con una ruta inventada, porque el verificador reconoce el acortador por su dominio real.
- Nombres, números de envío, folios y códigos se sustituyen por `[NOMBRE]` o `XXXX`. El test rechaza correos fuera de dominios reservados, oficiales o publicados, teléfonos españoles salvo los verificados de §5.6, IBAN, DNI y NIE.

## Reparto

| Conjunto | `no_oficial` | `no_determinable` | `oficial_verificado` | Total | SMS / correo / web |
| -------- | -----------: | ----------------: | -------------------: | ----: | ------------------ |
| dev      |           14 |                15 |                    6 |    35 | 19 / 15 / 1        |
| test     |            6 |                 7 |                    2 |    15 | 9 / 6 / 0          |

dev incluye los 10 mensajes de ejemplo del repo (5 / 4 / 1). test sale solo de SpaPhish, spam_ham_spanish y variantes nuevas; sus 2 `oficial_verificado` llevan URL de la allowlist que no aparecen en dev. Ningún texto de test se parece a uno de dev (Jaccard de tokens normalizados < 0,6).

## Casos difíciles de dev

La etiqueta de origen y la nuestra no coinciden:

| id     | Origen     | Nuestro           | Por qué                                                                                                        |
| ------ | ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| dev-23 | `spam`     | `no_determinable` | Acortador sin resolver y ningún organismo nombrado: no se puede concluir                                       |
| dev-24 | `phishing` | `no_determinable` | Suplanta a Netflix con urgencia y enlace, pero no hay regla publicada para empresas privadas (§5.4)            |
| dev-25 | `phishing` | `no_determinable` | Suplanta al SAT de México: fuera de la allowlist y de las reglas de §4.2, y no pide pago ni datos              |
| dev-28 | `spam`     | `no_determinable` | Pide verificar la cuenta bancaria sin nombrar a ninguno de los cinco organismos ni llevar enlace               |
| dev-29 | `phishing` | `no_determinable` | Sorteo a nombre de una aseguradora privada; ni dominio imitado ni regla de contenido aplicable                 |

## Conjunto de prueba

No está en el repo. Vive en el Mac mini en `~/sello-b-evals-holdout/test.json` (permisos `600`), fuera de cualquier worktree. `.gitignore` ignora `*evals-holdout/` y `src/datos/evals/**/test.json` por si alguien lo copia aquí, y `dev.test.ts` falla si aparece un `test.json` junto a `dev.json`. No se optimiza contra él: se usa solo para medir al final.
