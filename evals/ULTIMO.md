# Último eval

Generado por `bun run eval` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T18:37:47.956Z · commit: 49d84cf · conjunto: `src/datos/evals/dev.json` · casos: 35 × 3

- Accuracy: **90.5 %** (95/105) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **29/30** ❌ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Reservas (el modelo no respondió; cuentan como fallo): 5
- Casos inestables entre repeticiones: dev-25

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 18 |
| no_oficial | 89.4 % | 100.0 % | 42 |
| no_determinable | 100.0 % | 88.9 % | 45 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 18 | 0 | 0 |
| no_oficial | 0 | 42 | 0 |
| no_determinable | 0 | 5 | 40 |
