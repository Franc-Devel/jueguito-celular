# Referentes y dirección visual de Pulso

Revisión: 13 de octubre de 2026. Este documento distingue referencias de diseño, fuentes técnicas consultadas y datos que no se pudieron verificar.

## Referentes de juego

- **Mob Control**, mostrado por el usuario: cañón automático, puertas multiplicadoras, lectura clara de bandos y números, multitud avanzando por una pista. Es la referencia principal de la interacción y la multiplicación visible de proyectiles.
- **Count Masters**, **Survivor.io** y **Last War: Survival** son candidatos conocidos para una comparación posterior de hordas, legibilidad de enemigos, evolución de armas y presentación de combate. En esta sesión no se pudo acceder a sus fichas ni verificar qué mecánicas tienen sus versiones actuales.

Se intentó consultar Voodoo, la ficha de Mob Control en App Store y Habby. La red de la máquina rechazó esas conexiones con 403 antes de llegar a los sitios. No se dispone de un ranking comprobado de ventas o ingresos. No se atribuye a estos juegos un motor, pipeline gráfico o método de sonido no confirmado, ni se afirma que sus anuncios representen íntegramente su jugabilidad.

## Fuentes técnicas consultadas

- [Babylon.js: Particle System Intro](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/particles/particle_system/particle_system_intro.md). Consultado correctamente: capacidad máxima, emisión, vida útil, color y reutilización de partículas/texturas. Pulso implementa esos conceptos en Canvas, sin añadir Babylon.js.
- [Web Audio API 1.1, especificación](https://github.com/WebAudio/web-audio-api/blob/main/index.bs). Consultada correctamente: AudioContext, fuentes de buffer, osciladores, filtros, envolventes de ganancia y compresión. Los sonidos y el loop musical de Pulso son originales y sintetizados en el navegador.

## Aplicación al juego

**Personaje principal:** vehículo blindado con volumen por gradientes, ruedas/orugas, torreta y tubos visibles, retroceso, fogonazo y faros. Sus colores celeste y verde lo diferencian del enemigo.

**Enemigos:** definiciones separadas de caminante, corredor, blindado, mutante y barricada. Cada clase tiene tamaño, velocidad, resistencia y silueta propios. Articulación de extremidades, balanceo, sombra de contacto, accesorios y respuesta breve al impacto. El mutante tiene barra de salud principal y aviso de llegada.

**Rutas:** carril izquierdo de munición (+3 pelotitas) y derecho de taller (escudo, ráfaga o explosivo). Se abren disparando a sus contenedores, con progreso visual. Las mejoras del taller quedan en el arsenal local y pueden elegirse como equipamiento inicial. Las cajas opcionales no cuentan como bajas enemigas ni impiden completar la misión.

**Disparos:** una pelotita real por unidad de poder, estela y núcleo brillante; cruces de puertas ×2 generan nuevos proyectiles con separación lateral y una onda luminosa. Colisiones continuas entre posiciones anterior y actual para no perder impactos durante cuadros lentos. Los enemigos interceptan el disparo antes de puertas situadas detrás de ellos.

**Efectos y luces:** destellos locales aditivos, partículas de impacto, restos de enemigos, ondas expansivas y vibración corta al daño. Orden de dibujo por profundidad para que los objetos cercanos se superpongan correctamente. Movimiento reducido respeta la preferencia del sistema para vibración y borde de daño.

**Sonido:** disparo, impacto, eliminación, mejora, llegada del jefe, daño, victoria y derrota, más un loop musical suave. Volumen limitado, compresión y cantidad máxima de voces; mute persistente. Se inicia tras un gesto del usuario y el ambiente se detiene al pausar o cambiar de pestaña.

**Teléfono:** densidad máxima 2×, sprites de brillo reutilizados, límites de partículas y luces. Modo automático baja efectos/densidad si los cuadros son lentos; opción ahorro manual. La cantidad real de proyectiles se conserva. El mundo se reescala al rotar y el arrastre sigue un único dedo activo.

## Alcance

Gráficos originales procedurales 2.5D. No son modelos 3D comerciales ni recursos extraídos de otro juego. El objetivo es una versión web liviana y legible en teléfono, con mejoras verificables. El acceso privado del sitio y la validación final en iPhone real siguen siendo tareas separadas pendientes.


## Evidencia de la versión integrada

- 16 pruebas unitarias pasan.
- Navegador Chromium: multiplicación visible, primer impacto antes de una puerta situada detrás del enemigo, audio real, pausa y mute persistente, rotación y selección de calidad.
- Apertura de ambas rutas a tiros y recompensas distintas. Escudo, ráfaga y explosivo permanecen desbloqueados tras recargar. Una caja ignorada no quita vida ni demora la victoria.
- Simulación determinista de la versión con rutas: 40/40 partidas completadas en niveles 1, 2, 60 y 100, dos alturas, semillas 42–46; decisiones cada 150 ms y movimiento limitado. No equivale a probar todos los niveles con personas.
- Estrés de render con 576 proyectiles y 36 enemigos; también se ejercitó poder 48, ráfaga, explosivos y dos puertas ×2 durante juego real en Chromium. Sin errores del navegador, con cantidades de partículas y luces limitadas. No permite afirmar FPS en hardware iPhone.

Las pruebas de navegador se ejecutaron en esta máquina. No se verificó el deploy remoto por la política de red ni un iPhone físico.
