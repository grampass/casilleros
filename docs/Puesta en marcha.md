# Puesta en marcha

Volver a [[00 Inicio]]. Lista de lo que falta para pasar del prototipo a una versión que funcione de verdad. Actualizado: 2026-10-08 (ya hay visto bueno del CCOA).

## Lo que entrega Paolo
### Imprescindible
- [ ] **Disposición real** de cada bloque: columnas, filas, orden de numeración y una foto de frente. Ver [[Levantamiento]].
- [ ] **Registro actual de ocupantes** (los que renuevan), para cargarlos ya ocupados.
- [ ] **Precio** por ciclo y **medios de pago** (Yape/Plin: a nombre de quién, número o QR).
- [ ] **Fechas del periodo de alquiler** (inicio y cierre) y **fin del ciclo 2026-2**.
- [ ] **Correos de Logística** que entrarán al panel (Gmail o institucional).
- [ ] **Cuenta donde vivirá el sistema**: por ahora la de Paolo para probar; luego la del CCOA (`ccoa.fiqt@uni.edu.pe`). Ver [[Seguridad]].

### Para el diseño
- [ ] **Mascota** (gato con casco blanco) en PNG con fondo transparente, buena resolución; si hay varias poses, mejor.
- [ ] **Logo** en alta calidad (el monograma "CC" con aro naranja), idealmente PNG sin fondo o SVG.
- [ ] Si los afiches se hacen en Canva: nombre de las fuentes que usan.

### Reglas que el equipo debe confirmar
- [ ] ¿Quien lo tuvo en 2026-1 tiene prioridad para renovar?
- [ ] ¿Pueden alquilar alumnos de otras facultades?
- [ ] ¿Algún casillero queda para uso del CCOA? (se marca inhabilitado)
- [ ] ¿48 h para pagar está bien?
- [ ] Texto corto de condiciones (qué pasa si no se paga, fin de ciclo, objetos olvidados) y aceptación de uso de datos (Ley 29733).

## Lo que hace Claude
1. Backend en Google Sheets + Apps Script (`almacen-sheets.js`), con bloqueo para que dos personas no tomen el mismo casillero.
2. Inicio de sesión de Logística con lista de correos permitidos.
3. Abrir/cerrar el periodo de alquiler (fuera del periodo solo se ve el mapa y un aviso).
4. Correo de aviso a Logística por cada reserva.
5. Rediseño con la identidad del CCOA (mascota, logo, bloque "Centro Cultural Óscar Almenara").
6. Publicar la página y escribir una guía corta de uso para Logística.

## Estado de lo entregado (2026-10-08)
- Precio S/ 14, Yape a nombre de Paolo ✔ · QR: pendiente
- 48 h ✔ · condiciones: borrador abajo ✔ · prioridad de renovación ✔
- Cuenta: el correo institucional de Paolo por ahora ✔
- Disposición: se mantiene; fotos después · Lista de ocupantes: la pide al secretario
- Mascota: recibida y aplicada ✔ · Tipografía: Bebas Neue ✔

## GitHub
- Cuenta: con el **Gmail personal** de Paolo (el institucional se pierde al egresar); añadir `@uni.pe` como correo secundario para el GitHub Student Pack.
- Crear una **organización** gratuita (ej. `ccoa-fiqt`) y el repositorio `casilleros` dentro, para que el proyecto pase a otros miembros.
- El repositorio es la carpeta `PROYECTO/`. Ya están listos `README.md`, `.gitignore` y `.github/workflows/pagina.yml` (publica solo `sitio/`; las notas no se publican).
- En GitHub: Settings → Pages → Source: **GitHub Actions**.
- Ojo: si el repositorio es público, las notas de `docs/` se pueden leer en GitHub (no en la página). Con Student Pack se puede hacer privado y seguir usando Pages.

## Dónde se aloja
- **Página (lo que ven los alumnos):** GitHub Pages, gratis. Dirección tipo `ccoa-fiqt.github.io/casilleros`. Se enlaza desde `linktr.ee/ccoafiqt.uni`. Dominio propio opcional (no hace falta).
- **Datos:** una Google Sheet privada en la cuenta del CCOA; solo Apps Script la toca.
- **Migración:** se prueba en la cuenta de Paolo y luego se copia la Sheet y el script a la cuenta del CCOA (unos 15 min).

## Hoja de cálculo editable a mano
Paolo quiere poder alquilar "por fuera" editando la hoja, y que la página y la hoja siempre coincidan. Con Google Sheets se cumple porque **hay una sola fuente**: la página lee y escribe en la misma hoja. (No sirve el `.xlsx` de la computadora; tiene que ser una Google Sheet.)

Propuesta (a confirmar en la reunión) — pestaña **Casilleros**, una fila por casillero:

| Casillero | Ocupado ☑ | Pagó ☑ | Apellidos | Nombres | Código | Celular | Fecha | Notas |
|---|---|---|---|---|---|---|---|---|

- Marcar **Ocupado** → en la página sale ocupado. Desmarcar → libre.
- Ocupado sin **Pagó** → sale "reservado" (por pagar).
- Pestaña **Historial**: cada cambio (de la página o del panel) queda anotado; no se borra nada.
- Cambio de código necesario: hoy el estado se calcula de los alquileres ([[Modelo de datos]]); con esto la hoja manda. Se ajusta en `almacen-sheets.js` + Apps Script.

## Borrador de condiciones
1. El alquiler dura todo el ciclo y cuesta **S/ 14**.
2. Al reservar tienes **48 h** para pagar por Yape y enviar la captura por WhatsApp; si no, la reserva se libera.
3. Un casillero por persona. El candado lo pones tú.
4. Al terminar el ciclo hay un plazo de renovación; quienes ya tienen casillero tienen prioridad. Si no renuevas a tiempo, el casillero queda libre para otro alumno.
5. Al liberar tu casillero, retira tus cosas. *(confirmar: qué se hace con lo que quede)*
6. Tus datos (nombre, código y celular) solo los ve Logística y se usan únicamente para gestionar el alquiler (Ley 29733). Al reservar aceptas estas condiciones.

## Identidad visual observada (Instagram @ccoafiqt.uni)
- Mascota: gato naranja con casco blanco con logo CCOA y bata; aparece en casi todos los afiches.
- Colores: naranja, lila/morado (cumpleaños), blanco/crema; negro y dorado en eventos.
- Firma recurrente: "Centro / Cultural / Óscar / Almenara" en cuatro líneas, negrita pequeña, con una barra vertical al lado.
- Pie de afiche: iconos de redes + `@ccoafiqt.uni` + `ccoa.fiqt@uni.edu.pe`.
