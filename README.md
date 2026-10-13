# Pulso · Dead Highway

Juego web original de supervivencia en carretera: convoy armado, hordas de zombis, rutas de mejoras y puertas multiplicadoras. Sin anuncios, trackers ni dependencias de ejecución.

## Desarrollo y Netlify

Node.js 22 o posterior. Desde este directorio:

```sh
npm start
npm test
npm run check
```

El servidor escucha en loopback, puerto 3000. `HOST` y `PORT` permiten adaptar el runtime. Los archivos de `public/` son un sitio estático sin build. `netlify.toml` publica ese directorio; los pushes a `main` activan el despliegue del repositorio conectado.

## Cómo jugar

Disparo automático. Arrastrar en teléfono; mouse o flechas en computadora. Espacio o el botón pausa detienen la partida. Cambiar de pestaña pausa automáticamente.

- **Puertas:** +2 o ×2 aumentan la cantidad de pelotitas del cañón (máximo 48). Los proyectiles también se duplican al cruzar ×2, sin esperar al vehículo; cada puerta actúa una sola vez por proyectil. Límite de 192 proyectiles generados por ráfaga.
- **Ruta de munición:** abrir la caja celeste a tiros concede hasta +3 pelotitas, respetando el límite de la misión.
- **Ruta de taller:** abrir la caja dorada a tiros activa escudo, tiro rápido o proyectil explosivo. La mejora se agrega permanentemente al arsenal de ese navegador y puede equiparse antes de empezar otra misión. El explosivo causa daño de área; el escudo absorbe un golpe de un enemigo normal.
- Las cajas no quitan vida al pasar. Son opcionales salvo en Cruce de suministros, donde abrir dos forma parte del objetivo. Los bloqueos requieren romper la cantidad indicada de barricadas; si una llega al vehículo en su carril causa daño. Munición y taller pueden cambiar de costado entre misiones.
- Hay tres vidas. Si el mutante alcanza el convoy, se pierde aunque quede un escudo.

100 planes de misión deterministas en cinco regiones, con diez estilos de combate y siete variantes de objetivo. Los estilos de combate son: evacuación, suministros, corredores, blindados, pinza, slalom, reservas limitadas, emboscada, marea y peaje. Cambian formaciones, horarios, carriles de puertas/rutas, obstáculos y objetivos; reintentar conserva el mismo recorrido para poder aprenderlo. Clima, luz y carretera también varían entre misiones de una región.

Las misiones de combate requieren derrotar a sus jefes y completar los objetivos indicados. Las de rescate, minas y drones terminan al alcanzar la salida con vida; las de asedio requieren destruir dos bases dentro del plazo. Las misiones de suministros requieren abrir dos cajas. Otros contenedores son opcionales. Los jefes tienen comportamientos distintos: bruto, acorazado que alterna blindaje y núcleo expuesto, cargador que cambia de carril y acelera, y enjambre de tres jefes. Los pasos estrechos limitan el espacio de maniobra. Las misiones con pocas reservas tienen topes de 16 o 24 pelotitas; el HUD muestra poder actual/límite. Los niveles altos empiezan con más poder; las velocidades se normalizan por altura.

Ejemplo: 49 presenta una marea y tres jefes; 50 es Último peaje, noche con lluvia, curvas y dos barricadas obligatorias; 51 cambia a rescate de civiles. El 52 ofrece dos elecciones de mejoras, el 53 introduce minas, el 54 dos bases para asediar y el 55 drones con disparos hostiles. Antes de iniciar aparece el nombre y objetivo de la misión; el selector identifica su estilo.

Progreso, récord, sonido, calidad y arsenal se guardan en localStorage de ese navegador; no se sincronizan entre dispositivos. El sonido está apagado por defecto, se activa con un toque y se conserva la elección. Incluye música original suave y efectos de combate.

## Gráficos y rendimiento

Arte original procedural 2.5D: carretera con detalle de superficie y guardarraíles, zombis animados con clases visibles, blindado con conductor y faros, retroceso, fogonazo, estelas, partículas, iluminación local, restos e impactos. No usa recursos extraídos del juego de referencia.

Modo gráfico automático, alto y ahorro. Densidad máxima 2× y brillos reutilizados. El modo automático baja efectos y densidad durante cuadros lentos; conserva los proyectiles reales. Efectos, luces y voces de audio tienen límites. La vibración de cámara y borde de daño respetan la preferencia de movimiento reducido. El mundo se reescala al rotar la pantalla.

[Referentes, fuentes y decisiones visuales](docs/REFERENTES.md).

## Validación

31 pruebas unitarias: dificultad, puertas, proyectiles, reinicio, misiones, perspectiva, colisiones continuas, rotación, poder inicial, rutas/recompensas, 100 planes distintos, objetivos alcanzables, límite por misión, curvas, espacio de maniobra, blindaje del jefe, objetivos nuevos, mutaciones, puertas móviles, duelos por etapas y distribución de objetivos en toda la campaña.

Pruebas con Chromium: escritorio y viewport táctil 390×844, inicio/pausa/continuación, selector de 100 misiones, ausencia de desbordamiento horizontal, duplicación a través de ×2, finales de misión, objetivos incumplidos, escape del jefe, barricadas y cinco regiones. Web Audio real: disparos, silencio, pausa, reanudación y persistencia. Rutas: apertura por disparos, cuatro recompensas, arsenal tras recargar y objetivos de suministros. Se verificaron en navegador los niveles 49/50/51, tres jefes, fase de blindaje, límites de poder, briefing, selector y conservación del progreso previo. Rotación y modo ahorro. Prueba de estrés con 576 proyectiles y 36 enemigos en Chromium del entorno; no representa FPS de un iPhone.

La simulación del motor completó las 100 misiones con una estrategia que apunta a objetivos; verifica que son alcanzables y no sustituye el balance con jugadores. También se verificaron misiones móviles representativas y las fases nuevas de blindaje.

Falta prueba en iPhone real (Chrome usa WebKit en iOS), balance con jugadores y verificación del deploy publicado.

## Privacidad del sitio

Un repositorio privado no restringe el sitio. Antes de dar por concluido el deploy privado, configurar autenticación obligatoria en el hosting y permitir exclusivamente la cuenta del propietario. Verificar una sesión autorizada y el rechazo de acceso anónimo. Estos archivos no incluyen autenticación y el servidor local es solo para desarrollo.


## Nuevas misiones y elecciones

- **Rescate:** mover el convoy al civil azul cuando llega a la zona inferior; los disparos no le hacen daño. Rescatar tres y sobrevivir hasta la salida.
- **Laboratorio:** elegir dos mejoras durante la partida. La acción se pausa para elegir entre tres cartas.
- **Campo minado:** disparar para desactivar tres minas; otras se pueden esquivar. Chocar con una mina causa daño.
- **Asedio:** dos bases independientes; se conceden 25 segundos extra tras el recorrido para destruirlas.
- **Drones:** proyectiles rojos dirigidos hacia la posición del convoy; esquivarlos o destruir el dron. Sobrevivir hasta la salida.
- **Bifurcación:** cruzar REFUGIO repara y reduce la presión de las siguientes oleadas; ASALTO da hasta +4 poder y agrega blindados. Elegir un ramal forma parte de la misión.
- **Tres amenazas:** duelos escalonados con cargador, acorazado y bruto, en lugar de un solo mutante al final.

Las cartas se aplican solo a la misión actual: perforación (hasta tres enemigos por pelotita), rebote lateral, dispersión sin aumentar la cantidad de pelotitas, hielo que frena por 1,5 segundos o reparación. Se pueden combinar. Las armas del arsenal conservan sus desbloqueos permanentes.

Las puertas oscilan en determinadas misiones: la multiplicación usa su posición real en el instante del cruce. Se conservan las claves de progreso y arsenal previas.

[Alcance de las mejoras basadas en el documento aportado](docs/VARIEDAD_NIVELES.md).

La campaña distribuye 17 familias de misión mediante un listado explícito: no repite un ciclo de diez ni concentra objetivos nuevos solo en capítulos alternos. Cada bloque de diez después de las introducciones tiene al menos ocho familias. Todas las misiones posteriores al tutorial incluyen una decisión de mejoras. [Detalle de los 100 niveles](docs/CAMPANA_100.md).
