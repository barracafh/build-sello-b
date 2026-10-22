# Hill-climb del clasificador (LAB-49)

Solo con dev (`src/datos/evals/dev.json`, 35 casos). El conjunto de prueba no lo ve el harness: solo `bun run eval:holdout`, una vez, al final.

## Arreglos del harness (no son iteraciones)

Commit `49d84cf`, antes del barrido de los GLM y del bucle:

- **dev.ts:** el runner importaba `dev.json`, y dev-12, dev-13 y dev-17 llegaban al modelo con `[@]` en lugar de `@`. Ahora carga `dev.ts`, como pide `src/datos/evals/README.md`. Así ve el mismo texto que producción y que `eval:holdout`.
- **Reservas:** una reserva es una llamada al modelo sin respuesta (402, tiempo de 8 s agotado, JSON no válido). Antes solo se contaba si el motivo final era «clasificador no disponible». Si las señales deterministas ya dan `no_oficial`, `combinarClasificacion` responde sin el modelo y con otro motivo, y el fallo quedaba tapado. Ahora `esReserva` en `scripts/eval-lib.ts` cuenta toda llamada sin tokens (HelmCode informa de los tokens en cada respuesta). Lo usan `bun run eval`, `eval:holdout` y `scripts/barrido.ts`.
- **Las reservas cuentan como fallo**, aunque el veredicto coincida. Por eso el 34/35 de antes pasa a unos 31,7/35.

## Línea base oficial

`bun run eval --modelo deepseek-v4-flash --repeticiones 3`, commit `49d84cf`, prompt de `main`:

| Modelo | Accuracy media | Por pasada | Recall oficial_verificado / no_oficial / no_determinable | Falsos `oficial_verificado` | `no_oficial` → `no_determinable` | Ejemplos | Reservas | Latencia media | Tokens por caso |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| deepseek-v4-flash | **90.5 %** (95/105) | 31 · 32 · 32 | 100 % · 100 % · 88.9 % | 0 | 0 | 29/30 ❌ (una reserva en un ejemplo) | 5 | 3.5 s | 2 587 |

Fallos: dev-24 (`no_determinable` → `no_oficial`, las 3 pasadas), dev-25 (→ `no_oficial` en 2 pasadas, reserva en 1) y reservas sueltas en dev-17, dev-21, dev-26 y dev-29. Casi todo el margen son reservas por el tiempo de 8 s, así que la primera palanca es acortar el prompt.

## Barrido de modelos (una pasada, 35 casos, en serie, 1 s entre casos)

Las filas de deepseek, gemma4 y qwen3.6 son de antes de los arreglos (`cd3be57`), pero ya cuentan las llamadas sin tokens como reserva y como fallo.

`bun scripts/modelos.ts` lista 19 modelos el 2026-10-22. No son de chat: `kokoro`, `qwen3-embedding`, `rerank`, `whisper`. Un modelo se descarta si no da JSON válido en sus 3 primeras llamadas o si llega a 10 reservas.

| Modelo | Accuracy (reservas = fallo) | Recall oficial_verificado / no_oficial / no_determinable | Falsos `oficial_verificado` | `no_oficial` → `no_determinable` | Reservas | Latencia media | Tokens por caso | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| deepseek-v4-flash | 88.6 % (31/35) | 6/6 · 14/14 · 11/15 | 0 | 0 | 3 | 3.7 s (máx. 8.0 s) | 2 526 | candidato |
| gemma4 | — | — | — | — | 3/3 | 8.0 s (tiempo agotado) | — | descartado: ninguna respuesta en 8 s en los 3 primeros casos |
| qwen3.6 | — | — | — | — | 3/3 | 8.0 s (tiempo agotado) | — | descartado: ninguna respuesta en 8 s en los 3 primeros casos |
| glm5.3 | pendiente | | | | | | | |
| glm5.3-flash | pendiente | | | | | | | |
| glm5.2 | — | — | — | — | — | — | — | no disponible: HelmCode responde 400 «Invalid model name» aunque sale en `/models` |
| claude-fable-5, claude-haiku-4-5, claude-opus-5, claude-sonnet-5 | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` (modelo de terceros, la organización no tiene crédito) |
| gemini-3.5-flash-lite, gemini-3.6-flash | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` |
| gpt-5.6-luna, gpt-5.6-sol, gpt-5.6-terra | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` |

deepseek-v4-flash: el mismo 34/35 de `evals/ULTIMO.md` si las reservas cuentan como acierto. Fallos con reservas como fallo: dev-24 (`no_determinable` → `no_oficial`), y reservas en dev-17, dev-25 y dev-29 (salen `no_determinable` por la reserva, no por el modelo).
