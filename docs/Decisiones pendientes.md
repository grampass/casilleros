# Decisiones pendientes

Volver a [[00 Inicio]]. Ver también [[Puesta en marcha]].

> 2026-10-08: Paolo dio luz verde. Precio, Yape, condiciones, mascota y tipografía **ya están aplicados** en `sitio/`. Falta: QR de Yape, hoja editable (necesita el backend), arriba/abajo del mapa.

## Ya decidido
- [x] Duración: por ciclo.
- [x] Uno por persona.
- [x] El candado lo pone cada alumno; no se registra.
- [x] Consultas y pago se coordinan por WhatsApp con Logística (966 378 397).
- [x] Colores: naranja con toques morados; logo del CCOA.
- [x] Código por módulos y documentado en Obsidian.
- [x] **Precio:** S/ 14 por ciclo → `CONFIG.precio = 14` ✔ aplicado.
- [x] **Pago:** Yape a nombre de Paolo Palacios; la captura se manda al mismo WhatsApp → `CONFIG.yape` ✔. Falta el QR: guardarlo como `sitio/assets/yape-qr.png` y poner `qr: 'assets/yape-qr.png'`.
- [x] **Tipografía:** Bebas Neue para títulos (la que usan en Canva) + DM Sans para texto ✔.
- [x] **Mascota** en la portada y en la confirmación de reserva ✔.
- [x] **Plazo para pagar:** 48 h (ya está así).
- [x] **Renovación:** al terminar el periodo hay un plazo para renovar; quienes ya tienen casillero tienen **prioridad**. Si no renuevan, se les avisa y el casillero pasa a libre. Publicidad avisa por redes cuando el plazo esté por cerrar.
- [x] **Casilleros del CCOA:** algunos de adentro (bloque A) y uno de afuera (bloque B). Logística los marca; en el sistema van como inhabilitados/ocupados.
- [x] **Cuenta y acceso por ahora:** todo con el correo institucional de Paolo (`@uni.pe`). Correos de Logística se definen después.
- [x] **Disposición:** se queda como está (5×4 por bloque) hasta que Paolo mande fotos. Ver [[Levantamiento]].
- [x] **Texto de condiciones:** sí; borrador en [[Puesta en marcha#Borrador de condiciones]].
- [x] **Excel y página sincronizados:** Logística debe poder alquilar editando la hoja (casilla de "Ocupado") y que la página se actualice, y al revés. Ver [[Puesta en marcha#Hoja de cálculo editable a mano]].

## Por definir
- [ ] Mostrar en el mapa qué fila está **arriba** y cuál **abajo** (¿1A arriba o abajo?) → con las fotos.
- [ ] Fechas del periodo de alquiler, del plazo de renovación y fin de ciclo → `CONFIG.finDeCiclo`.
- [ ] Correos de Logística con acceso al panel.
- [ ] ¿Pueden alquilar alumnos de otras facultades? (en el Excel antiguo aparecía "Otra facu").
- [ ] Qué casilleros exactos son del CCOA.
- [ ] Registro renovado de ocupantes (el secretario lo enviará) para cargarlo.
- [ ] Cuenta definitiva del CCOA donde vivirá el sistema. Ver [[Seguridad]].
