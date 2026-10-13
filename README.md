# Pulso

Juego web original de supervivencia en carretera, con convoy armado, hordas de zombis y puertas multiplicadoras. Sin anuncios, trackers, cuentas ni dependencias de ejecución.

## Desarrollo

Node.js 22 o posterior. Desde este directorio:

```sh
npm start
npm test
npm run check
```

El servidor escucha en loopback, puerto 3000. `HOST` y `PORT` permiten adaptar el runtime de un hosting. Los archivos de `public/` también se pueden alojar como sitio estático sin build.

## Cómo jugar

Disparo automático. Arrastrar sobre la pista en teléfono; mouse o flechas en computadora. Cruzar puertas +2 o ×2 aumenta la cantidad de pelotitas por disparo (máximo 48); cada pelotita hace un punto de daño. Además, los tiros que cruzan una puerta ×2 se duplican en la pista con un destello; cada puerta actúa una sola vez por proyectil. Se pueden encadenar, con un máximo de 192 proyectiles generados por ráfaga para mantener el rendimiento. Las puertas +2 mejoran el cañón al cruzarlas. Hay tres vidas y un jefe al final de cada pista. Si el jefe alcanza la base, se pierde. Espacio o el botón pausa detienen la partida. Cambiar de pestaña pausa automáticamente.

100 misiones con parámetros progresivos; se desbloquean de una en una. Cinco regiones: ruta del éxodo, ciudad en cuarentena, bosque infectado, paso congelado y zona cero. Los objetivos alternan entre eliminar una cantidad de zombis, destruir dos barricadas y cazar al mutante. Todas las misiones requieren frenar al jefe final; si alcanza el convoy, se pierde. Caminantes, corredores y zombis blindados aparecen en grupos. El objetivo y su avance están visibles arriba de la carretera. El progreso se guarda en localStorage de ese navegador; no se sincroniza entre dispositivos. Sonido opcional, apagado de inicio. Gráficos originales en Canvas con perspectiva 2.5D, escenario en movimiento, zombis animados, vehículo con torreta, partículas y destellos. No utiliza los recursos del juego de referencia.

## Privacidad del deploy

Un repositorio privado no restringe el acceso al sitio. Antes de publicar, configurar en el hosting autenticación obligatoria y permitir exclusivamente la cuenta del propietario. No publicar con una URL pública como sustituto de ese control. No hay autenticación integrada en estos archivos: el servidor local es solo para desarrollo.

El flujo actual es GitHub + Netlify: cada push a main activa el despliegue continuo. netlify.toml publica public/ sin build. El acceso privado por cuenta todavía debe configurarse en el hosting y comprobarse con una sesión autorizada y otra anónima.

## Validación de esta versión

Diez pruebas unitarias: parámetros de los 100 niveles, cálculo de puertas, reinicio de estado, cantidad y daño de proyectiles duplicación de pelotitas, cruces de puertas, encadenamiento, límites, objetivos de misión y proyección. Verificación de sintaxis y pruebas de navegador Chromium a 1280×900 y 390×844: inicio, pausa, continuación, selector de niveles y ausencia de desbordamiento horizontal. También se comprobaron en Chromium los desenlaces de misión, objetivos incumplidos, escape del jefe, aparición de barricadas y carga de las cinco regiones. Falta validación en iPhone real (Chrome usa WebKit en iOS), balance de dificultad de los 100 niveles y deploy privado.
