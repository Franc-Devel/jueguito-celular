# Ajuste de dificultad

El cañón alcanzaba 48 pelotitas con demasiada facilidad y podía dispararlas cada 0,11 segundos. La resistencia de los enemigos crecía mucho menos, los jefes no disparaban y el último tramo de cada recorrido tenía poca presión. Variar la misión no corregía ese desequilibrio.

## Cambios

- La resistencia y la velocidad aumentan gradualmente, sin saltos de salud cada diez niveles. Los jefes también crecen más que antes.
- La cantidad de oleadas aumenta de siete a catorce antes de aplicar variantes. Hay refuerzos en oleadas alternas desde el 21 y el último grupo llega más cerca del cierre. Las primeras oleadas avanzadas tienen menos resistencia para preparar el cañón.
- Hay menos multiplicadores consecutivos y un intervalo algo mayor entre puertas. ×2 sigue duplicando proyectiles y poder; cada disparo conserva todas sus pelotitas.
- La recarga aumenta con el tamaño de la ráfaga: aproximadamente 0,17 s con cuatro pelotitas y 0,29 s con 48. Ráfaga reduce ese tiempo un 24 %.
- Jefes desde el 10, drones y bases fijan una mira roja 0,8 segundos antes de disparar. La mira no persigue al jugador después de fijarse. Los jefes disparan tres proyectiles en abanico desde el 41; las bases, desde el 61. Se anuncian las tres trayectorias.
- Desde el 20 los jefes traen dos escoltas por los flancos; desde el 60 una es blindada. El bruto ahora cambia de carril. Los duelos sucesivos esperan a que caiga el jefe anterior.
- El hielo reduce un 28 % la velocidad de jefes y blindados, frente al 55 % de los enemigos comunes. La carta explica esta resistencia.
- Los rescates desde el 51 requieren cuatro civiles y las minas cinco desactivaciones. Ambas familias agregan un dron desde el 21. Los objetivos de bajas también aumentan.
- La salud de los jefes de misiones con poder limitado se ajusta a su tope de pelotitas. No se borran niveles desbloqueados, arsenal ni récords.

## Verificación

36 pruebas unitarias y comprobación sintáctica. Chromium verifica el aviso antes de disparar, la mira fija, el abanico, el período de protección ante impactos, escoltas, ataques de bases, espera entre duelos, conservación del progreso y arsenales, y diseño en 390×844, 1280×900 y 844×390. Las tres cartas siguen visibles y seleccionables en horizontal.

`scripts/balance.mjs` ejecuta la actualización real del juego con DOM y audio simulados. Usa las colisiones, velocidades, mejoras y derrotas reales; el movimiento tiene el mismo límite que el teclado. Los resultados se imprimen como JSON. `objective` busca objetivos y esquiva; `center` permanece inmóvil; `sweep` barre sinusoidalmente. `expert` añade anticipación del movimiento y evaluación de trayectorias, con información completa del motor. Estos controladores no representan jugadores humanos y una derrota del controlador no demuestra que una misión sea imposible.

Resultados de esta revisión, mundo móvil de 390×664:

| Recorrido | Estrategia y arsenal | Victorias |
| --- | --- | --- |
| Los 100 niveles | Objetivos, cañón estándar | 76 / 100 |
| 1 y cada décimo nivel hasta 100 | Objetivos, estándar y ráfaga | 14 / 22 |
| Mismo muestreo | Barrido, estándar y ráfaga | 14 / 22 |
| Mismo muestreo | Inmóvil, estándar y ráfaga | 0 / 22 |

Antes del ajuste, el controlador de objetivos completaba los 100 niveles. Ahora también pierde encuentros avanzados. Esto evidencia un aumento de presión; no establece una tasa de victoria esperada para una persona ni garantiza que todos los niveles tengan una dificultad uniforme. Los duelos 60 y 70 se completaron con el controlador de anticipación y ráfaga; en el 100 ese controlador perdió, por lo que el cierre necesita validación con jugadores.

Repetir el recorrido completo en una terminal POSIX:

```sh
PULSO_PATTERNS=objective PULSO_GEARS=standard PULSO_WIDTH=390 PULSO_HEIGHT=664 node scripts/balance.mjs $(seq 1 100)
```

No se ha medido el balance con personas ni el rendimiento en un iPhone físico. Tampoco se confirma desde este entorno que Netlify haya terminado su despliegue.
