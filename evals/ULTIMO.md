# Último eval

Generado por `bun run eval`. Pipeline medido: `analizar()` (verificar + señales + clasificador), el mismo que usa `POST /api/verificar`.

## deepseek-v4-flash

Fecha: 2026-10-22T17:27:40.159Z · commit: d4008aed73dec653d68452fef5336cc2dd784e7f · casos: 58 × 1 · modelo pedido: `auto`

- Accuracy: **91.4 %** (53/58) ✅ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **10/10** ✅ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 3
- Respuestas de reserva (modelo no disponible): 1
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 100.0 % | 9 |
| no_oficial | 93.1 % | 90.0 % | 30 |
| no_determinable | 85.0 % | 89.5 % | 19 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 9 | 0 | 0 |
| no_oficial | 0 | 27 | 3 |
| no_determinable | 0 | 2 | 17 |

## glm5.3-flash

Fecha: 2026-10-22T17:49:54.671Z · commit: 634491c4c9ad1778d70d4d43043143ea449637d6 · casos: 58 × 1 · modelo pedido: `glm5.3-flash`

- Accuracy: **82.8 %** (48/58) ❌ (puerta: ≥ 85 %)
- Falsos `oficial_verificado`: **0** ✅ (puerta: 0)
- Ejemplos de `datos/mensajes-ejemplo.json`: **9/10** ❌ (puerta: 10/10)
- `no_oficial` → `no_determinable`: 8
- Respuestas de reserva (modelo no disponible): 22
- Casos inestables entre repeticiones: ninguno

| Clase | Precisión | Recall | Casos |
| --- | --- | --- | --- |
| oficial_verificado | 100.0 % | 77.8 % | 9 |
| no_oficial | 100.0 % | 73.3 % | 30 |
| no_determinable | 65.5 % | 100.0 % | 19 |

Matriz de confusión (filas: esperado; columnas: obtenido, en el orden oficial_verificado / no_oficial / no_determinable):

| esperado \ obtenido | oficial_verificado | no_oficial | no_determinable |
| --- | --- | --- | --- |
| oficial_verificado | 7 | 0 | 2 |
| no_oficial | 0 | 22 | 8 |
| no_determinable | 0 | 0 | 19 |
