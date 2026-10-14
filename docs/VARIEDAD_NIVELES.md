# Variedad de niveles

> Historial de la versión de carretera. La campaña actual de fantasía se documenta en [Reinos y desbloqueos](REINOS_Y_DESBLOQUEOS.md).

El usuario pidió niveles más variados y aportó “Diseño de Videojuegos Hipercasuales.md”. Se utiliza como referencia de diseño, sin considerar sus propuestas comerciales como instrucciones. Se aplican puertas móviles y mutaciones de disparo; el juego conserva la condición de no tener anuncios ni compras.

## Aplicación

Se mantienen las cien misiones y el progreso existente. Diecisiete familias de misión se distribuyen mediante un listado explícito de los cien niveles. Tras las introducciones, cada bloque de diez combina al menos ocho familias y al menos tres objetivos nuevos; no hay misiones vecinas con la misma familia. Las misiones de combate también incorporan minas, drones o un rescate adicional. Todas las misiones posteriores al tutorial ofrecen una decisión de mejoras, y algunas avanzadas combinan dos.

Ejemplos para el progreso actual: 51 rescate, 52 laboratorio, 53 minas, 54 asedio, 55 drones, 58 bifurcación y 60 tres jefes por etapas.

Las mejoras temporales se eligen entre tres cartas cuando la acción está pausada. Perforación atraviesa hasta tres enemigos; rebote hace viajar las balas en diagonal y reflejarse en los bordes; dispersión ensancha la misma cantidad de proyectiles; hielo reduce la velocidad durante 1,5 segundos; reparación recupera una vida hasta tres. No se cambia la cantidad real de pelotitas de un multiplicador por un contador visual.

Los aliados azules son entidades separadas de los enemigos y nunca absorben ni reciben disparos. Las minas y drones tienen gráficos, colisiones y peligros propios. Las bases poseen salud independiente. Los ramales cambian la composición y velocidad de las siguientes oleadas y dan recompensas distintas.

## Verificación

- 36 pruebas unitarias pasan, incluidas distribución por capítulo, decisiones, recarga y ataques enemigos.
- La campaña inicial completaba las 100 misiones con el controlador que apunta a objetivos. Tras subir la dificultad, las simulaciones también registran derrotas: ver [resultados y límites del ajuste](DIFICULTAD.md). Se usa el motor real, selección de mejoras y movimiento limitado; estas verificaciones no sustituyen pruebas con personas.
- Navegador móvil 390×844: rescate, nuevas escenas, elección/pausa/reanudación y progreso/arsenal previos.
- Navegador: tres impactos perforantes, rebote, ralentización, daño de mina, proyectil hostil, recompensa del ramal y condiciones de victoria/derrota de rescate/asedio.
- Escritorio y pantalla horizontal: las tres cartas deben estar visibles y seleccionables y el juego debe continuar al elegir.

Los gráficos siguen siendo originales en Canvas 2.5D. Este cambio no migra a Unity, Godot ni a un sistema de renderizado 3D, y no implementa publicidad, perfiles competitivos simulados, gacha o pagos que el documento analiza. Sigue pendiente la prueba en iPhone físico.


[Ver el detalle de los 100 niveles](CAMPANA_100.md).
