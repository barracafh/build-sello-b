# Marca de Everdá

«Everdá» es «¿es verdad?» dicho deprisa. La marca es su «E» en Geist Black, blanca sobre la caja roja de Sol (`--brand`, `#df1717`), y el nombre va en Geist SemiBold con un tracking de -0,025 em: la misma familia en dos pesos.

| Archivo | Para qué |
| --- | --- |
| `everda-marca.svg` · `.png` (512 px) | La marca sola: avatar, icono, diapositiva. |
| `everda-logo.svg` · `.png` | Marca y nombre en negro, sobre fondo claro. |
| `everda-logo-blanco.svg` · `.png` | Marca y nombre en blanco, sobre fondo oscuro. |

Los SVG llevan las letras en curvas, así que no dependen de tener Geist instalada. Los PNG tienen fondo transparente.

## En la web

- `src/components/Marca.tsx` dibuja la marca (`<Marca />`) y pone en rojo el «¿» de los titulares (`<Pregunta>`).
- `src/app/icon.svg` es el favicon: repite el dibujo con los colores escritos, porque no lee CSS. `icon.test.ts` comprueba que sigan siendo iguales.
- El nombre, la frase y el carácter `E` salen de `ficha.json` (`nombre`, `frase` e `icono`).

## Uso

- Deja alrededor de la marca un margen de al menos un cuarto de su lado.
- No la uses por debajo de 16 px ni cambies sus colores: rojo y blanco, siempre.
- El nombre se escribe con tilde: Everdá.
