# Pulso · Reinos en guerra

Juego web original de cañones azules, ejércitos, caballeros gigantes y cien conquistas sobre puentes de fantasía. Sin anuncios, trackers ni dependencias de ejecución.

## Jugar

Arrastrá para mover los cañones en teléfono; usá mouse o flechas en computadora. Los soldados se reclutan automáticamente. Espacio o el botón pausa detienen la batalla; cambiar de pestaña pausa el juego.

- Las puertas azules suman cañones. Los portales multiplican las tropas que pasan por ellos, sin cambiar la batería: ×2, ×3, ×7 y ×99.
- Desde el primer nivel hay reclutamiento y ×2; ×3 llega en el 2, la torre ×7 en el 4 y ×99 en el 8.
- Los soldados azules y rojos chocan con bajas reales; los supervivientes siguen marchando. Veteranos y lanceros aumentan la fuerza de cada soldado.
- Los cofres se abren a tiros: refuerzos, escudo, ráfaga o artillería. Las torres doradas abren portales potentes al destruirlas.
- El juego introduce reglas nuevas: empalizadas, rescates, bombas, magos, ramales, duelos, maldiciones, fuego, curadores, portales fugaces, carro de la corona, flanqueos y guardia real. Los niveles intermedios combinan formaciones, caminos, objetivos y sorpresas.
- Una mira roja fija anuncia los ataques. El círculo dorado anuncia fuego en el suelo. El estandarte rojo cura tropas cercanas. El carro tiene su propia vida: protegelo.

[Desbloqueos y reglas](docs/REINOS_Y_DESBLOQUEOS.md) · [Las 100 conquistas](docs/CAMPANA_100.md).

El nivel desbloqueado, el récord y el arsenal se guardan por navegador. Esta mejora de legibilidad conserva las partidas existentes; no cambia la versión de guardado ni vuelve a aplicar el reinicio de la campaña anterior. El sonido conserva su configuración. Los gráficos quedan siempre en calidad alta. No se sincronizan entre dispositivos. El mapa muestra ✦ cuando hay una nueva mecánica; al elegir una misión se muestra su explicación antes de empezar.

## Desarrollo y Netlify

Node.js 22 o posterior. Desde este directorio:

```sh
npm start
npm test
npm run check
```

El servidor local escucha en 127.0.0.1:3000; HOST y PORT permiten adaptarlo. Netlify publica public/ sin build; los pushes a main activan el despliegue del repositorio conectado.

Para estudiar el balance con el motor real:

```sh
PULSO_PATTERNS=objective,expert PULSO_GEARS=standard node scripts/balance.mjs 1 25 45 50 70 100
```

## Arte y rendimiento

Arte original procedural 2.5D: cinco reinos, puentes de piedra, agua, castillos, banderas, nieve, cañones múltiples, tropas animadas, armaduras, caballeros, cofres y portales. Los soldados usan sprites generados y reutilizados localmente. Las formaciones grandes conservan su población de combate y usan muestras visuales cuando superan el presupuesto de dibujo; no se simulan miles de agentes independientes. El HUD muestra las tropas vivas. Las tropas se dibujan con un mínimo de unos 26 px de alto incluso al fondo, los cañones crecen y la batería se acomoda al acercarse a los bordes. Portales y recompensas tienen rótulos mayores; misión, objetivos y mejoras se leen en un panel de alto contraste con texto que puede ocupar varias líneas. Las cantidades grandes usan k/M en el HUD, conservando el total real en combate. Esta mejora visual conserva la versión de guardado, los niveles, el récord y el arsenal.

Calidad alta fija, densidad máxima 2×, efectos y voces limitados. Las preferencias anteriores de calidad automática o ahorro ya no reducen el detalle. Sonidos originales de cañones, choque, portales y batalla mediante Web Audio; sonido apagado por defecto y botón de altavoz junto a pausa para activarlo o silenciarlo, con preferencia guardada.

En celular y pantallas táctiles, el juego ocupa todo el viewport disponible, sin márgenes ni encabezado exterior. Respeta las áreas seguras del iPhone y se adapta al espacio que dejan las barras del navegador (`100dvh`), al rotar y al cambiar el tamaño. En escritorio de más de 900 px con puntero preciso, la batalla ocupa la mitad derecha de la pantalla; las instrucciones quedan a la izquierda. El cambio de diseño conserva el progreso y reescala el mundo sin perder entidades.

## Validación

52 pruebas de reglas y campaña; comprobación sintáctica. Chromium verifica combate, portales, eventos, desbloqueos y progresión. Para este diseño se comprobaron 320×568, 375×667, 390×844, 844×390, 1280×900 y 1920×1080: área de juego, densidad alta, arrastre, mouse, flechas, pausa, órdenes, activación/silencio del audio y persistencia del progreso. Una partida guardada en nivel 50 conserva su nivel, récord y arsenal al recargar. La simulación recorre las cien misiones y registra victorias y derrotas; no sustituye el balance con personas. Falta prueba en iPhone físico y comprobación del deploy publicado.

## Acceso privado

El repositorio privado no protege la página publicada. El hosting necesita autenticación obligatoria que permita únicamente al propietario. Esta app estática no incluye autenticación; el servidor local es solo para desarrollo.

## Historial técnico

Los documentos de [referentes](docs/REFERENTES.md), [variedad anterior](docs/VARIEDAD_NIVELES.md) y [dificultad anterior](docs/DIFICULTAD.md) registran las versiones previas de carretera. Las reglas actuales están en Reinos y desbloqueos.
