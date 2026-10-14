# Pulso · Reinos en guerra

Juego web original de cañones azules, ejércitos, caballeros gigantes y cien conquistas sobre puentes de fantasía. Sin anuncios, trackers ni dependencias de ejecución.

## Jugar

Arrastrá para mover los cañones en teléfono; usá mouse o flechas en computadora. Los soldados se reclutan automáticamente. Espacio o el botón pausa detienen la batalla; cambiar de pestaña pausa el juego.

- Las puertas azules suman cañones. Los portales multiplican las tropas que pasan por ellos, sin cambiar la batería: ×2, ×3, ×7 y ×99.
- Los soldados azules y rojos chocan con bajas reales; los supervivientes siguen marchando. Veteranos y lanceros aumentan la fuerza de cada soldado.
- Los cofres se abren a tiros: refuerzos, escudo, ráfaga o artillería. Las torres doradas abren portales potentes al destruirlas.
- El juego introduce reglas nuevas: empalizadas, rescates, bombas, magos, ramales, duelos, maldiciones, fuego, curadores, portales fugaces, carro de la corona, flanqueos y guardia real. Los niveles intermedios combinan formaciones, caminos, objetivos y sorpresas.
- Una mira roja fija anuncia los ataques. El círculo dorado anuncia fuego en el suelo. El estandarte rojo cura tropas cercanas. El carro tiene su propia vida: protegelo.

[Desbloqueos y reglas](docs/REINOS_Y_DESBLOQUEOS.md) · [Las 100 conquistas](docs/CAMPANA_100.md).

Progreso, arsenal, récord, sonido y calidad se guardan en este navegador y se conservan desde la versión anterior. No se sincronizan entre dispositivos. El mapa muestra ✦ cuando hay una nueva mecánica; al elegir una misión se muestra su explicación antes de empezar.

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

Arte original procedural 2.5D: cinco reinos, puentes de piedra, agua, castillos, banderas, nieve, cañones múltiples, tropas animadas, armaduras, caballeros, cofres y portales. Los soldados usan sprites generados y reutilizados localmente. Las formaciones grandes conservan su población de combate y usan muestras visuales cuando superan el presupuesto de dibujo; no se simulan miles de agentes independientes. El HUD muestra las tropas vivas.

Calidad automática, alta y ahorro, densidad máxima 2×, efectos y voces limitados. El modo ahorro reduce la cantidad de figuras dibujadas sin quitar soldados del combate. Sonidos originales de cañones, choque, portales y batalla mediante Web Audio; sonido apagado por defecto y activación con un toque. El mundo se reescala al rotar.

## Validación

46 pruebas de reglas y campaña; comprobación sintáctica. Chromium verifica combate, portales, eventos, desbloqueos, progresión y diseños móvil, escritorio y horizontal. La simulación recorre las cien misiones y registra victorias y derrotas; no sustituye el balance con personas. Falta prueba en iPhone físico y comprobación del deploy publicado.

## Acceso privado

El repositorio privado no protege la página publicada. El hosting necesita autenticación obligatoria que permita únicamente al propietario. Esta app estática no incluye autenticación; el servidor local es solo para desarrollo.

## Historial técnico

Los documentos de [referentes](docs/REFERENTES.md), [variedad anterior](docs/VARIEDAD_NIVELES.md) y [dificultad anterior](docs/DIFICULTAD.md) registran las versiones previas de carretera. Las reglas actuales están en Reinos y desbloqueos.
