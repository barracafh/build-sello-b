# Último eval

Generado por `bun run eval` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T19:06:29.384Z · commit: df1b67c · conjunto: `src/datos/evals/dev.json` · casos: 35 × 1

- Accuracy: **91.4 %** (32/35) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **10/10** ✅ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Reservas (el modelo no respondió; cuentan como fallo): 1
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 6 |
| no_oficial | 87.5 % | 100.0 % | 14 |
| no_determinable | 100.0 % | 86.7 % | 15 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 6 | 0 | 0 |
| no_oficial | 0 | 14 | 0 |
| no_determinable | 0 | 2 | 13 |
