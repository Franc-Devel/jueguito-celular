# Pulso

Juego web original de cañón y oleadas, inspirado en la mecánica de puertas multiplicadoras. Sin anuncios, trackers, cuentas ni dependencias de ejecución.

## Desarrollo

Node.js 22 o posterior. Desde este directorio:

```sh
npm start
npm test
npm run check
```

El servidor escucha en loopback, puerto 3000. `HOST` y `PORT` permiten adaptar el runtime de un hosting. Los archivos de `public/` también se pueden alojar como sitio estático sin build.

## Cómo jugar

Disparo automático. Arrastrar sobre la pista en teléfono; mouse o flechas en computadora. Cruzar puertas +2 o ×2 aumenta el daño (máximo 48). Hay tres vidas y un jefe al final de cada pista. Si el jefe alcanza la base, se pierde. Espacio o el botón pausa detienen la partida. Cambiar de pestaña pausa automáticamente.

100 niveles con parámetros progresivos; se desbloquean de uno en uno. El progreso se guarda en localStorage de ese navegador; no se sincroniza entre dispositivos. Sonido opcional, apagado de inicio. No reproduce los gráficos ni la simulación de multitudes del juego de referencia.

## Privacidad del deploy

Un repositorio privado no restringe el acceso al sitio. Antes de publicar, configurar en el hosting autenticación obligatoria y permitir exclusivamente la cuenta del propietario. No publicar con una URL pública como sustituto de ese control. No hay autenticación integrada en estos archivos: el servidor local es solo para desarrollo.

Sites está pendiente: no había herramientas de publicación Sites disponibles en la sesión de creación. Verificar que el servicio permita controles de acceso por cuenta y probar tanto acceso autorizado como rechazo anónimo antes de dar por terminado el deploy privado.

## Validación de esta versión

Tres pruebas unitarias: parámetros de los 100 niveles, cálculo de puertas y reinicio de estado. Verificación de sintaxis y pruebas de navegador Chromium a 1280×900 y 390×844: inicio, pausa, continuación, selector de niveles y ausencia de desbordamiento horizontal. Falta validación en iPhone real (Chrome usa WebKit en iOS), balance de dificultad de los 100 niveles y deploy privado.
