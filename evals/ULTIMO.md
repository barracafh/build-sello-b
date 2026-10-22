# Último eval

Generado por `bun run eval` en local (una pasada, en serie, 1 s entre casos). Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T19:44:44.129Z · commit: 7e49741 · conjunto: `src/datos/evals/dev.json` · casos: 41 × 1

- Accuracy: **97.6 %** (40/41) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **10/10** ✅ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 0
- Respuestas de reserva (modelo no disponible): 0
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 6 |
| no_oficial | 94.4 % | 100.0 % | 17 |
| no_determinable | 100.0 % | 94.4 % | 18 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 6 | 0 | 0 |
| no_oficial | 0 | 17 | 0 |
| no_determinable | 0 | 1 | 17 |
