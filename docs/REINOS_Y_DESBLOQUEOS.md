# Reinos en guerra

La referencia visual aportada inspira un juego original de cañones azules, soldados, hordas rojas, caballeros gigantes y puentes de piedra. No usa el logo ni los recursos de Top Lords. No incorpora anuncios, pagos ni competición ficticia.

## Reglas de combate

Los cañones reclutan soldados automáticamente. Las puertas +1 y sus versiones avanzadas suman cañones; los portales ×2, ×3, ×7 y ×99 multiplican los soldados que los atraviesan. El ejército combate con bajas: se resta la fuerza gastada y los supervivientes siguen avanzando. Los lanceros y los veteranos cambian la eficacia de cada soldado, sin inventar población. La torre ×7 aparece desde el 4 y la ×99 desde el 8, en un carril distinto al de referencia de la primera oleada; abrirla compite con reforzar ese frente. Abrirla a tiros genera su portal temporal.

La población se calcula para el combate. Por ejemplo, un soldado que cruza ×99 produce un original y 98 refuerzos; al vencer a 30 reclutas quedan 69 soldados, salvo que intervengan armadura o mejoras. Para mantener el rendimiento se agrupan soldados en formaciones con población explícita, se limita la generación a 8192 por salva y se usan muestras visuales cuando el ejército supera el presupuesto de dibujo. Los números grandes no representan 8192 objetos de física independientes. El HUD muestra la población viva real.

Los eventos se programan de forma determinista: se puede aprender una misión al reintentarla. Contraataques, maldiciones, fuego, curadores, portales fugaces y flanqueos se combinan después de desbloquearse. El carro dorado añade un objetivo que puede recibir daño independiente. En el tramo final aparecen el rey y sus refuerzos al perder media vida.

## Desbloqueos

Cada desbloqueo se anuncia antes de comenzar y se marca con ✦ en el mapa. Entre estos hitos, las misiones combinan lo aprendido con otras rutas y objetivos. Esta publicación reinicia las partidas anteriores desde el nivel 1 para recorrer los cambios desde el comienzo. El nuevo progreso vuelve a guardarse normalmente.

| Nivel | Mecánica | Cómo cambia la decisión |
| --- | --- | --- |
| 1 | La batería azul | Cada cañón recluta soldados. Mové la batería para dirigir el ejército. |
| 1 | Portales ×2 | Los soldados se multiplican al atravesar el portal; el cañón queda atrás. |
| 2 | Talleres del reino | Abrí cofres a tiros: más cañones, escudo, ráfaga o artillería. |
| 2 | Portales ×3 | Triplicá la formación que cruza el portal, sin aumentar los cañones. |
| 3 | Incursores | Las tropas ligeras atacan más rápido: cambiá de frente a tiempo. |
| 3 | Portales móviles | El portal se mueve. Apuntá al lugar por el que va a pasar tu tropa. |
| 4 | Guardias acorazados | Los escudos enemigos requieren concentrar soldados en un carril. |
| 4 | Portal ×7 | Un portal potente puede cambiar el frente de batalla; abrí su torre primero. |
| 5 | Dos destinos | REFUGIO repara y reduce la presión; ASALTO concede poder y suma guardias. |
| 6 | Empalizadas | Destruí los bloqueos marcados antes de que alcancen la batería. |
| 6 | Bombas del puente | Desactivá bombas a tiros o esquivalas con la batería. |
| 7 | Portales malditos | El portal rojo quita tropas. Elegí el azul o rodeá la maldición. |
| 8 | Órdenes de batalla | Elegí lanceros, hielo, flanqueo, dispersión o reparación durante la batalla. |
| 8 | Portal ×99 | Destruí la torre dorada para abrir un portal que convierte una tropa en un ejército. |
| 9 | La gran horda | El ejército rojo se divide en columnas. Elegí qué frente reforzar. |
| 9 | Civiles del reino | Recogé civiles azules mientras mantenés a raya al ejército rojo. |
| 10 | Caballeros gigantes | La mira roja anuncia su ataque. Salí de la línea y buscá su núcleo. |
| 10 | Lluvia de fuego | Los círculos del suelo anuncian un impacto. Movete antes de que caiga. |
| 11 | Caravana de rescate | El rescate se convierte en el objetivo principal: reuní tres civiles y llegá al refugio. |
| 15 | Magos de guerra | Destruí a los magos o esquivá sus proyectiles anunciados. |
| 20 | Duelos sucesivos | Tres caballeros, tres estilos. Cada duelo exige cambiar de estrategia. |
| 30 | Contraataques | Nuevas tropas pueden entrar por los costados a mitad de la misión. |
| 31 | Veteranos del reino | Tus soldados ganan armadura y fuerza: cada uno puede vencer dos reclutas rojos. |
| 50 | Estandartes de curación | El estandarte rojo recupera tropas cercanas. Destruílo antes de atacar la horda. |
| 60 | Portales fugaces | Algunos portales duran pocos segundos: aprovechalos antes de que desaparezcan. |
| 61 | La legión azul | Cada soldado gana fuerza para vencer tres reclutas rojos. Usá esa ventaja para repartir el ejército. |
| 70 | Carro de la corona | Protegé el carro dorado: los proyectiles también pueden dañarlo. |
| 80 | Portales de flanqueo | Las tropas que entran reaparecen en otro carril. Prepará el destino. |
| 90 | Guardia real | El rey gigante alterna escudo y núcleo expuesto. No descuides sus escoltas. |
| 91 | Guardia azul de élite | Tus soldados alcanzan su máxima fuerza: cuatro reclutas rojos por soldado, antes de aplicar lanceros. |
| 95 | Última resistencia | Al perder media vida, el jefe llama una nueva oleada de guardias. |
| 100 | La corona roja | El cierre combina los tres duelos, portales, magos y el carro de la corona. |

[Listado de las 100 conquistas](CAMPANA_100.md).

## Validación y límites

52 pruebas de población, bajas, encadenamiento de multiplicadores, maldiciones, veteranos, metas, calendario, escolta y desbloqueos. Chromium comprueba el portal ×99, mejoras separadas de cañones, supervivientes, apertura de torres, curación, fuego, daño al carro, traslado de tropas, expiración de puertas, refuerzos del rey y desbloqueo del nivel siguiente. Verifica controles y cartas en 390×844, 1280×900 y 844×390, sin desbordamiento y con reinicio único de progreso, récord, arsenal y arma seleccionada; se conservan los avances nuevos al recargar.

Las diez primeras misiones renovadas se completaron en 20 simulaciones con dos controladores, usando el mundo móvil de 390×664 y cañón estándar. El recorrido completo de las cien misiones registró 92 victorias con el controlador de objetivos; las ocho derrotas son resultados de balance, no errores del runtime. El simulador ejecuta la actualización real y limita la velocidad del movimiento. Incluye selección de portales y anticipación del movimiento; sus victorias y derrotas no establecen una tasa de éxito humana. Falta validación con jugadores e iPhone físico. El push a main activa el despliegue de Netlify, pero no confirma por sí solo la versión publicada.

## Reinicio de esta publicación

`public/save.js` identifica la campaña como `kingdom-fresh-start-v2`. Al cargarla por primera vez, pone el nivel desbloqueado en 1, récord en 0, arsenal vacío y cañón estándar. Se escribe la versión después del reinicio. Las victorias posteriores se guardan con claves de esta campaña: una pestaña del juego anterior no puede recuperar el nivel 50 o 100 sobre la partida nueva. No se elimina todo localStorage; sonido, calidad y datos ajenos al juego conservan su valor. Si el almacenamiento falla, se inicia desde 1 y se mantiene el avance durante la sesión.

No hay contadores globales en un servidor. El reinicio llega a cada navegador al cargar la nueva versión publicada. Una pestaña que ya estaba abierta debe recargarse. Los recursos publicados usan `Cache-Control: no-cache` para revalidar la versión. Este reinicio no se repite en cada visita.
