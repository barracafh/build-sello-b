# Hill-climb del clasificador (LAB-49)

Solo con dev (`src/datos/evals/dev.json`, 35 casos). El conjunto de prueba no lo ve el harness: solo `bun run eval:holdout`, una vez, al final.

## Cómo se cuentan las reservas

Una **reserva** es una llamada al modelo que no da respuesta (402, tiempo de 8 s agotado, JSON no válido). `bun run eval` solo cuenta las que acaban en el motivo «clasificador no disponible». Si las señales deterministas ya dan `no_oficial`, `combinarClasificacion` responde sin el modelo con otro motivo, y el fallo queda tapado. El barrido (`bun scripts/barrido.ts`) cuenta como reserva toda llamada sin tokens: HelmCode informa de los tokens en cada respuesta. Las reservas cuentan como fallo en la columna «Accuracy».

## Barrido de modelos (una pasada, 35 casos, en serie, 1 s entre casos)

`bun scripts/modelos.ts` lista 19 modelos el 2026-10-22. No son de chat: `kokoro`, `qwen3-embedding`, `rerank`, `whisper`. Un modelo se descarta si no da JSON válido en sus 3 primeras llamadas o si llega a 10 reservas.

| Modelo | Accuracy (reservas = fallo) | Recall oficial_verificado / no_oficial / no_determinable | Falsos `oficial_verificado` | `no_oficial` → `no_determinable` | Reservas | Latencia media | Tokens por caso | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| deepseek-v4-flash | 88.6 % (31/35) | 6/6 · 14/14 · 11/15 | 0 | 0 | 3 | 3.7 s (máx. 8.0 s) | 2 526 | candidato |
| gemma4 | — | — | — | — | 3/3 | 8.0 s (tiempo agotado) | — | descartado: ninguna respuesta en 8 s en los 3 primeros casos |
| qwen3.6 | — | — | — | — | 3/3 | 8.0 s (tiempo agotado) | — | descartado: ninguna respuesta en 8 s en los 3 primeros casos |
| glm5.3 | pendiente | | | | | | | |
| glm5.3-flash | pendiente | | | | | | | |
| glm5.2 | — | — | — | — | — | — | — | descartado: HelmCode responde 400 «Invalid model name» aunque sale en `/models` |
| claude-fable-5, claude-haiku-4-5, claude-opus-5, claude-sonnet-5 | — | — | — | — | — | — | — | descartados: 402 `subscription_required` (modelo de terceros, la organización no tiene crédito) |
| gemini-3.5-flash-lite, gemini-3.6-flash | — | — | — | — | — | — | — | descartados: 402 `subscription_required` |
| gpt-5.6-luna, gpt-5.6-sol, gpt-5.6-terra | — | — | — | — | — | — | — | descartados: 402 `subscription_required` |

deepseek-v4-flash: el mismo 34/35 de `evals/ULTIMO.md` si las reservas cuentan como acierto. Fallos con reservas como fallo: dev-24 (`no_determinable` → `no_oficial`), y reservas en dev-17, dev-25 y dev-29 (salen `no_determinable` por la reserva, no por el modelo).
