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
- **Ruta izquierda:** apuntar a la caja de munición y abrirla a tiros concede +3 pelotitas.
- **Ruta derecha:** abrir el taller a tiros activa escudo, tiro rápido o proyectil explosivo. La mejora se agrega permanentemente al arsenal de ese navegador y puede equiparse antes de empezar otra misión. El explosivo causa daño de área; el escudo absorbe un golpe de un enemigo normal.
- Las cajas de rutas son opcionales; ignorarlas no resta vida ni bloquea la victoria. Las barricadas de las misiones de bloqueo son objetivos obligatorios y sí causan daño si llegan al convoy.
- Hay tres vidas. Si el mutante alcanza el convoy, se pierde aunque quede un escudo.

100 misiones en cinco regiones: ruta del éxodo, ciudad en cuarentena, bosque infectado, paso congelado y zona cero. Objetivos de eliminación, barricadas y mutante. Todas requieren vencer al jefe final y cumplir el objetivo mostrado. Los niveles altos empiezan con más poder y una primera puerta cercana; las velocidades se normalizan por altura de pantalla.

Progreso, récord, sonido, calidad y arsenal se guardan en localStorage de ese navegador; no se sincronizan entre dispositivos. El sonido está apagado por defecto, se activa con un toque y se conserva la elección. Incluye música original suave y efectos de combate.

## Gráficos y rendimiento

Arte original procedural 2.5D: carretera con detalle de superficie y guardarraíles, zombis animados con clases visibles, blindado con conductor y faros, retroceso, fogonazo, estelas, partículas, iluminación local, restos e impactos. No usa recursos extraídos del juego de referencia.

Modo gráfico automático, alto y ahorro. Densidad máxima 2× y brillos reutilizados. El modo automático baja efectos y densidad durante cuadros lentos; conserva los proyectiles reales. Efectos, luces y voces de audio tienen límites. La vibración de cámara y borde de daño respetan la preferencia de movimiento reducido. El mundo se reescala al rotar la pantalla.

[Referentes, fuentes y decisiones visuales](docs/REFERENTES.md).

## Validación

16 pruebas unitarias: dificultad, puertas, proyectiles, reinicio, misiones, perspectiva, colisiones continuas, rotación, poder inicial y rutas/recompensas.

Pruebas con Chromium: escritorio y viewport táctil 390×844, inicio/pausa/continuación, selector de 100 misiones, ausencia de desbordamiento horizontal, duplicación a través de ×2, finales de misión, objetivos incumplidos, escape del jefe, barricadas y cinco regiones. Web Audio real: disparos, silencio, pausa, reanudación y persistencia. Rutas: apertura por disparos, cuatro recompensas, arsenal tras recargar, cajas ignoradas sin daño ni demora de victoria. Rotación y modo ahorro. Prueba de estrés con 576 proyectiles y 36 enemigos en Chromium del entorno; no representa FPS de un iPhone.

Falta prueba en iPhone real (Chrome usa WebKit en iOS), balance con jugadores y verificación del deploy publicado.

## Privacidad del sitio

Un repositorio privado no restringe el sitio. Antes de dar por concluido el deploy privado, configurar autenticación obligatoria en el hosting y permitir exclusivamente la cuenta del propietario. Verificar una sesión autorizada y el rechazo de acceso anónimo. Estos archivos no incluyen autenticación y el servidor local es solo para desarrollo.
