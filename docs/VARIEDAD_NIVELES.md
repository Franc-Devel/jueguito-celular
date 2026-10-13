# Variedad de niveles

El usuario pidió niveles más variados y aportó “Diseño de Videojuegos Hipercasuales.md”. Se utiliza como referencia de diseño, sin considerar sus propuestas comerciales como instrucciones. Se aplican puertas móviles y mutaciones de disparo; el juego conserva la condición de no tener anuncios ni compras.

## Aplicación

Se mantienen las cien misiones y el progreso existente. Diez estilos de combate alternan por capítulos con siete variantes funcionales: rescate, laboratorio, minas, asedio, drones, elección de ramal y tres duelos de jefes. Los capítulos impares, incluidos los primeros diez niveles, conservan el combate conocido; los capítulos pares presentan los objetivos nuevos. Esto facilita aprender las nuevas reglas antes de combinarlas con otras formaciones y climas.

Ejemplos para el progreso actual: 51 rescate, 52 laboratorio, 53 minas, 54 asedio, 55 drones, 58 bifurcación y 60 tres jefes por etapas.

Las mejoras temporales se eligen entre tres cartas cuando la acción está pausada. Perforación atraviesa hasta tres enemigos; rebote hace viajar las balas en diagonal y reflejarse en los bordes; dispersión ensancha la misma cantidad de proyectiles; hielo reduce la velocidad durante 1,5 segundos; reparación recupera una vida hasta tres. No se cambia la cantidad real de pelotitas de un multiplicador por un contador visual.

Los aliados azules son entidades separadas de los enemigos y nunca absorben ni reciben disparos. Las minas y drones tienen gráficos, colisiones y peligros propios. Las bases poseen salud independiente. Los ramales cambian la composición y velocidad de las siguientes oleadas y dan recompensas distintas.

## Verificación

- 29 pruebas unitarias pasan.
- 100 misiones completadas en simulación usando el motor real, selección de mejoras y movimiento limitado; cinco pruebas adicionales del ramal ASALTO completadas. Estas verificaciones muestran que los objetivos son alcanzables y no sustituyen pruebas con personas.
- Navegador móvil 390×844: rescate, nuevas escenas, elección/pausa/reanudación y progreso/arsenal previos.
- Navegador: tres impactos perforantes, rebote, ralentización, daño de mina, proyectil hostil, recompensa del ramal y condiciones de victoria/derrota de rescate/asedio.
- Escritorio y pantalla horizontal: las tres cartas deben estar visibles y seleccionables y el juego debe continuar al elegir.

Los gráficos siguen siendo originales en Canvas 2.5D. Este cambio no migra a Unity, Godot ni a un sistema de renderizado 3D, y no implementa publicidad, perfiles competitivos simulados, gacha o pagos que el documento analiza. Sigue pendiente la prueba en iPhone físico.
