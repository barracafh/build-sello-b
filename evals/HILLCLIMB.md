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
| glm5.3 | — | — | — | — | 10 de 12 | 7.9 s (las que responden: 6.4–7.4 s) | — | descartado: 10 reservas por tiempo en los 12 primeros casos |
| glm5.3-flash | — | — | — | — | 10 de 14 | 7.8 s (las que responden: 7.0–7.6 s) | — | descartado: 10 reservas por tiempo en los 14 primeros casos |
| glm5.2 | — | — | — | — | — | — | — | no disponible: HelmCode responde 400 «Invalid model name» aunque sale en `/models` |
| claude-fable-5, claude-haiku-4-5, claude-opus-5, claude-sonnet-5 | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` (modelo de terceros, la organización no tiene crédito) |
| gemini-3.5-flash-lite, gemini-3.6-flash | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` |
| gpt-5.6-luna, gpt-5.6-sol, gpt-5.6-terra | — | — | — | — | — | — | — | no disponibles: 402 `subscription_required` |

deepseek-v4-flash: el mismo 34/35 de `evals/ULTIMO.md` si las reservas cuentan como acierto. Fallos con reservas como fallo: dev-24 (`no_determinable` → `no_oficial`), y reservas en dev-17, dev-25 y dev-29 (salen `no_determinable` por la reserva, no por el modelo).

## Bucle: solo deepseek-v4-flash

Ningún otro modelo pasa el corte. Los de terceros no están disponibles (402) y `glm5.2` da 400. `gemma4`, `qwen3.6`, `glm5.3` y `glm5.3-flash` no responden en 8 s, o lo hacen muy al límite. El bucle se hace con un solo modelo.

Regla para quedarse con un cambio: la accuracy media sobre 3 pasadas sube y ninguna puerta empeora respecto a la línea base: 0 falsos `oficial_verificado`, recall de `no_oficial` igual o mayor, y ejemplos ≥ 29/30. El candidato final necesita 30/30 en los ejemplos.

| # | Cambio | Accuracy media | Por pasada | Falsos OV | Recall no_oficial | Ejemplos | Reservas | Latencia media (respondidas) | Tokens por caso | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Línea base (prompt de `main`) | 90.5 % (95/105) | 31 · 32 · 32 | 0 | 100 % | 29/30 | 5 | 3.5 s | 2 587 | — |
| 1 | Prompt condensado (las mismas reglas y apartados, en menos palabras) y salida acotada (como mucho 3 señales, citas cortas, motivo de menos de 25 palabras) | 91.4 % (96/105) | 32 · 31 · 33 | 0 | 100 % | 27/30 ❌ | 6 | 2.8 s | 1 764 | **revertido**: los ejemplos bajan de 29/30 a 27/30 |
| 2 | Prompt de `main` con la salida acotada: como mucho 3 señales, citas de menos de 12 palabras, motivo de menos de 25 | 92.4 % (97/105) | 33 · 32 · 32 | 0 | 100 % | 30/30 ✅ | 4 | 3.2 s | 2 498 | **se queda**: +2 aciertos y todas las puertas pasan |

Iteración 1: baja la latencia media y los tokens, pero las reservas siguen en los mismos casos (dev-17, dev-24 y dev-25 agotan los 8 s). dev-17, un ejemplo, también sale `no_oficial` una vez. Lo que tarda es la cola de esos casos, no la media.

Iteración 2: los fallos que quedan son dev-24 (sale `no_oficial` en las 3 pasadas), dev-25 (`no_oficial` una vez y reserva dos) y dev-21 (reserva dos veces). +2 aciertos sobre 105 está cerca del ruido entre pasadas. Aun así, cumple la regla (media mayor y ninguna puerta peor) y es el primer candidato con 30/30 en los ejemplos.

## Tras el merge de `main` (LAB-62, `fragmento`) y los límites de crédito

El merge `df1b67c` trajo de `main` el campo `fragmento` y otra redacción de `evidencia`. Los números de las iteraciones 0–2 se midieron antes, con un prompt que ya no está en la rama. Desde las 21:03 (hora de Madrid), Edu pone estos límites para proteger el crédito de HelmCode, que comparte producción:
- Exploración con `--repeticiones 1`.
- Solo deepseek-v4-flash.
- Como mucho 6 pasadas de 35 llamadas.
- Parar si hay un 402 o si las reservas suben respecto a la pasada anterior.

No se ha vuelto a medir `main` aparte: la referencia es la línea base de 95/105, y `main` ha cambiado desde entonces.

| Pasada | Prompt | Llamadas | Accuracy | Falsos OV | Recall no_oficial | Ejemplos | Reservas | Latencia media (respondidas) | Tokens por caso | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | `main` en `df1b67c` (re-baseline pedido antes de los límites) | ≈ 8 (cortada al llegar los límites; sin informe) | — | — | — | — | — | — | — | abandonada |
| 1 | `df1b67c`: iteración 2 + `fragmento` | 35 | 91.4 % (32/35) | 0 | 100 % | 10/10 | 1 (dev-21, 8 s) | 3.7 s | 2 607 | candidato actual: todas las puertas pasan |
| 2 | Iteración 3: §5.4, última fila, dicha explícita para empresas privadas y organismos de otros países (sin regla publicada → `no_determinable`, salvo que se hagan pasar por un organismo español de §4.2) | 35 | 94.3 % (33/35) | 0 | 100 % | 9/10 ❌ | 2 (dev-08 y dev-17, 8 s) | 4.3 s | 2 775 | **revertida, y parada obligatoria**: las reservas suben de 1 a 2 |

Iteración 3: corrige dev-24 y dev-25, y no hay ningún veredicto equivocado. Los 2 fallos son tiempos agotados de 8 s (dev-17 es un ejemplo, de ahí el 9/10). Como sube la latencia, las reservas pasan de 1 a 2 y eso dispara la parada de Edu. No hubo ningún 402.

**Bucle parado.** Llamadas gastadas desde los límites: 70 de 210, más ≈ 8 de la pasada cortada. No se ha hecho la medición final con `--repeticiones 3`. El candidato en la rama es el de la pasada 1, medido en una sola pasada.

## Medición final (decisión de Edu, opción 1)

`bun run eval --modelo deepseek-v4-flash --repeticiones 3` sobre `97e94ed`: el candidato de la pasada 1, con `main` mergeado. Dev tiene ahora 41 casos (LAB-63).

| Llamadas | Accuracy media | Por pasada | Falsos OV | Recall no_oficial | Ejemplos | Reservas | Latencia media (respondidas) | Tokens por caso |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 123 | 89.4 % (110/123) | 36 · 36 · 38 de 41 | 0 ✅ | 100 % ✅ | **26/30 ❌** | **8** (3 · 3 · 2), todas por los 8 s; ningún 402 | 3.6 s | 2 670 |

- **Ejemplos:** dev-17 (un ejemplo) agota los 8 s en las 3 pasadas y dev-04 en una. Por eso el 26/30. No hay ningún veredicto equivocado en los ejemplos: todos sus fallos son reservas.
- **Veredictos equivocados:** dev-24 (las 3 pasadas) y dev-25 (2 de 3), los dos `no_determinable` → `no_oficial`. La iteración 3 los corregía, pero se revirtió por las reservas.
- **Parada:** las reservas por pasada (3 · 3 · 2) son más que en la pasada 1 (1 de 35), así que se aplica la regla de Edu: se para, sin reintentos. El candidato **no pasa la puerta de ejemplos** y se entrega así, como pidió el Senior Engineer.
- **Total de llamadas desde los límites:** 70 + ≈ 8 + 123 ≈ 201 de 210.
- **Lectura:** el techo es la latencia de deepseek frente al tiempo fijo de 8 s en unos pocos casos largos (dev-17, dev-21, dev-25), no la calidad del veredicto.
