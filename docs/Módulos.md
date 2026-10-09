# Módulos

Volver a [[00 Inicio]]. Cada archivo tiene una sola tarea. Para cambiar algo, busca aquí en qué archivo está. **Todas las rutas son dentro de `PROYECTO/sitio/`.**

## ¿Qué quiero cambiar? → ¿Qué archivo abro?

| Quiero cambiar… | Archivo |
|---|---|
| Ciclo, precio, número de WhatsApp, horas de reserva, uno por persona | `js/config.js` |
| Datos de Yape (titular, número, QR) | `js/config.js` → `yape` (el QR va en `assets/` y se pone su ruta en `qr`) |
| Texto de las condiciones | `js/config.js` → `condiciones` (`{horas}` se reemplaza solo) |
| Redes y correo del pie de página | `js/config.js` → `redes` |
| Cuántos casilleros hay, columnas, filas, orden de numeración | `js/config.js` → `bloques` |
| Colores de la página (incluida la cabecera oscura `--oscuro`) | `css/base.css` → `:root` |
| Tipografía (`--fuente-titulos` = Bebas Neue, `--fuente-texto` = DM Sans) | `css/base.css` → `:root` + el enlace de Google Fonts en cada `.html` |
| Logo | `assets/logo-claro.png` (sobre fondo oscuro) · `assets/logo-recortado.png` (sobre fondo blanco) |
| Mascota | `assets/mascota.png` (recortada, fondo transparente; original en `CCOA/material/`) |
| Aspecto de botones, mapa, formularios, tablas | `css/componentes.css` |
| Qué se valida (código UNI, celular, uno por persona) | `js/logica/reglas.js` |
| Qué se guarda y cómo (reservar, pagar, liberar) | `js/datos/api.js` |
| Dónde se guardan los datos | `js/datos/almacen-local.js` (prototipo) → luego `almacen-sheets.js` |
| Textos y pasos de la página pública | `index.html` + `js/paginas/publico.js` |
| Panel de Logística | `logistica.html` + `js/paginas/logistica.js` |
| Mensajes de WhatsApp | `js/paginas/publico.js` (al alumno) y `logistica.js` (desde Logística) |

## Capas

```
páginas (publico.js, logistica.js)      ← lo que se ve
   │  usan
ui (mapa.js, modal.js, formato.js)      ← piezas visuales reutilizables
   │
datos/api.js                            ← ÚNICA puerta a los datos
   │  usa                     │ usa
logica/reglas.js          datos/almacen-*.js   ← dónde se guarda
   │
config.js                               ← ajustes
```

**Regla:** las páginas nunca tocan el almacén; siempre pasan por `api.js`. Así, cambiar de "navegador" a "Google Sheets" solo cambia una línea en `api.js`.

## Archivos
- `js/config.js`: ajustes generales. Ver [[Decisiones pendientes]].
- `js/logica/reglas.js`: validaciones (`validarSolicitud`; `validarReserva` añade la aceptación de condiciones, solo para la página pública), estados, generación de casilleros y su posición en el mapa.
- `js/datos/api.js`: funciones públicas (`verMapa`, `reservar`) y de Logística (`verTodo`, `confirmarPago`, `asignar`, `liberar`, `cambiarHabilitado`, `exportarCSV`). Libera solas las reservas vencidas. Ver [[Modelo de datos]].
- `js/datos/almacen-local.js`: guarda en `localStorage` (solo prototipo).
- `js/datos/demo.js`: datos de ejemplo con nombres inventados para presentar. Se activan con `?demo` al final de la dirección (`?demo&abrir=9A` abre el formulario; `&enviar` muestra la confirmación). Las capturas de `CCOA/capturas/` salen de aquí.
- `js/ui/mapa.js`: dibuja los bloques como en la realidad.
- `js/ui/modal.js`: ventana emergente.
- `js/ui/formato.js`: fechas, precio, lista de condiciones, enlaces de WhatsApp, protección contra HTML inyectado.
- `js/paginas/publico.js`, `js/paginas/logistica.js`: arman cada página.
- `css/base.css`, `css/componentes.css`: estilos.
- `assets/`: logos y mascota.
