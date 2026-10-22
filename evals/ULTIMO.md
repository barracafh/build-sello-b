# Último eval

Generado por `bun run eval` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T18:21:57.243Z · commit: 4c18cee · conjunto: `src/datos/evals/dev.json` · casos: 41 × 1

- Accuracy: **95.1 %** (39/41) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **10/10** ✅ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Respuestas de reserva (modelo no disponible): 2
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 6 |
| no_oficial | 89.5 % | 100.0 % | 17 |
| no_determinable | 100.0 % | 88.9 % | 18 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 6 | 0 | 0 |
| no_oficial | 0 | 17 | 0 |
| no_determinable | 0 | 2 | 16 |

## glm5.3-flash

Fecha: 2026-10-22T18:15:14.039Z · commit: df0efbc · conjunto: `src/datos/evals/dev.json` · casos: 35 × 1

- Accuracy: **77.1 %** (27/35) ❌ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **9/10** ❌ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 2
- Respuestas de reserva (modelo no disponible): 23
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | — | 0.0 % | 6 |
| no_oficial | 100.0 % | 85.7 % | 14 |
| no_determinable | 65.2 % | 100.0 % | 15 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 0 | 0 | 6 |
| no_oficial | 0 | 12 | 2 |
| no_determinable | 0 | 0 | 15 |
