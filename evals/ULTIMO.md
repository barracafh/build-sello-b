# Último eval

Generado por `bun run eval` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T17:58:02.543Z · commit: 5bddd64 · conjunto: `src/datos/evals/dev.json` · casos: 35 × 1

- Accuracy: **97.1 %** (34/35) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **10/10** ✅ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Respuestas de reserva (modelo no disponible): 2
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 6 |
| no_oficial | 93.3 % | 100.0 % | 14 |
| no_determinable | 100.0 % | 93.3 % | 15 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 6 | 0 | 0 |
| no_oficial | 0 | 14 | 0 |
| no_determinable | 0 | 1 | 14 |

## glm5.3-flash

Fecha: 2026-10-22T18:03:18.337Z · commit: 5bddd64 · conjunto: `src/datos/evals/dev.json` · casos: 35 × 1

- Accuracy: **82.9 %** (29/35) ❌ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **9/10** ❌ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Respuestas de reserva (modelo no disponible): 21
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | — | 0.0 % | 6 |
| no_oficial | 100.0 % | 100.0 % | 14 |
| no_determinable | 71.4 % | 100.0 % | 15 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 0 | 0 | 6 |
| no_oficial | 0 | 14 | 0 |
| no_determinable | 0 | 0 | 15 |
