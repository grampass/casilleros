# Contexto del proyecto: Casilleros CCOA

> **Para cualquier IA o persona que continúe este proyecto.** Lee este archivo primero: resume todo lo decidido, lo hecho y lo pendiente, sin necesidad de conversaciones anteriores. Última actualización: **2026-10-08**.
> Si cambias algo importante, **actualiza este archivo** (sección 9, "Historial").

---

## 1. Qué es
Página web para que la **Secretaría de Logística** del **Centro Cultural Óscar Almenara (CCOA)**, de la Facultad de Ingeniería Química y Textil (FIQT) de la **Universidad Nacional de Ingeniería (UNI, Lima, Perú)**, alquile los casilleros por ciclo de forma ordenada.

- **Responsable:** Paolo Palacios (Logística del CCOA, estudiante de Ing. Química). El equipo del CCOA ya dio el visto bueno.
- **Problema que resuelve:** el alquiler era desordenado (Excel a mano, varias personas "metiendo la mano", sin saber qué estaba libre).
- **Idioma:** todo en español (textos, código, comentarios, notas).

## 2. Cómo funciona (para el usuario)
**Alumno (página pública):**
1. Ve el mapa de casilleros con su estado (libre, reservado, ocupado, inhabilitado).
2. Elige uno libre y llena apellidos, nombres, código UNI y celular, y acepta las condiciones.
3. El casillero queda **reservado 48 h**: nadie más puede tomarlo.
4. Yapea **S/ 14** a Paolo Palacios (966 378 397) y envía la captura por **WhatsApp** (botón con el mensaje ya escrito).
5. Logística confirma el pago → el casillero pasa a **ocupado**. Si no paga en 48 h, se libera solo.

**Logística (panel interno):** ve quién tiene cada casillero y su contacto, confirma pagos, asigna a mano, libera, inhabilita, busca, ve la bitácora (quién hizo qué) y exporta a Excel (CSV).

**El público nunca ve nombres ni celulares**, solo el estado de cada casillero.

## 3. Reglas del negocio (decididas)
| Regla | Valor |
|---|---|
| Duración | Un ciclo (ciclo actual: **2026-2**) |
| Precio | **S/ 14** por ciclo |
| Pago | Yape a nombre de **Paolo Palacios**, **966 378 397**; captura al mismo WhatsApp |
| WhatsApp de Logística | 966 378 397 (`51966378397`) |
| Plazo para pagar | 48 h; si no, la reserva se cancela sola |
| Casilleros por persona | Uno (se controla por código UNI) |
| Candado | Lo pone cada alumno; no se registra |
| Renovación | Al terminar el ciclo hay un plazo de renovación; **quienes ya tienen casillero tienen prioridad**. Si no renuevan, se les avisa y el casillero queda libre. Publicidad del CCOA avisa por redes. |
| Casilleros del CCOA | Algunos de adentro (bloque A) y uno de afuera (bloque B) son para el CCOA; Logística los marca como inhabilitados/ocupados |
| Periodo de alquiler | Solo al inicio de cada ciclo |
| Datos personales | Casilla obligatoria de aceptación (Ley 29733, Perú) |

**Condiciones** (texto mostrado en la página, editable en `sitio/js/config.js` → `condiciones`):
1. El alquiler dura todo el ciclo y es un casillero por persona. El candado lo pones tú.
2. Al reservar tienes 48 h para pagar por Yape y enviar la captura por WhatsApp; si no, la reserva se libera.
3. Al terminar el ciclo hay un plazo de renovación. Quienes ya tienen casillero tienen prioridad; si no renuevas a tiempo, el casillero queda libre para otro alumno.
4. Al dejar tu casillero, retira todas tus cosas.
5. Tus datos (nombre, código y celular) solo los ve Logística y se usan únicamente para gestionar el alquiler (Ley 29733).

## 4. Casilleros (disposición)
- **Bloque A:** dentro del CCOA, 1A–20A. **Bloque B:** fuera del CCOA, 1B–20B.
- Hoy se dibujan como **5 columnas × 4 filas**, numerados por filas (provisional, aceptado por Paolo).
- Pendiente: Paolo enviará fotos para saber qué fila está arriba y cuál abajo, y el orden real de numeración.
- El Excel `material/Casilleros 2026-1 (antiguo).xlsx` está **desactualizado**: solo sirve para la disposición, no para los ocupantes.

## 5. Estado técnico actual
**Es un prototipo funcional:** todo funciona, pero **los datos se guardan solo en el navegador** (`localStorage`). Un alumno que reserve desde su celular no aparece en el panel de otra computadora. **Falta el backend real** (sección 7).

### Tecnología
- HTML + CSS + JavaScript puro con módulos ES. **Sin dependencias, sin compilación, sin npm.**
- Debe servirse por HTTP (los módulos no abren con doble clic):
  ```bash
  python -m http.server 8080 -d sitio
  ```
  Público: `http://localhost:8080` · Panel: `http://localhost:8080/logistica.html`
  Con `?demo` al final se cargan datos de ejemplo inventados (`?demo&abrir=9A` abre el formulario; `&enviar` lo envía).

### Arquitectura (capas)
```
páginas   sitio/js/paginas/publico.js, logistica.js   ← arman cada página
ui        sitio/js/ui/mapa.js, modal.js, formato.js   ← piezas visuales
datos     sitio/js/datos/api.js                       ← ÚNICA puerta a los datos
          sitio/js/datos/almacen-local.js             ← guarda en localStorage (prototipo)
          sitio/js/datos/demo.js                      ← datos de ejemplo
lógica    sitio/js/logica/reglas.js                   ← validaciones y estados
ajustes   sitio/js/config.js                          ← TODO lo editable
```
**Regla:** las páginas nunca tocan el almacén, siempre pasan por `api.js`. Para pasar al backend real se crea `almacen-sheets.js` y se cambia una línea en `api.js`.

### Modelo de datos
- **Casilleros:** `id` (`7B`), `bloque`, `numero`, `habilitado`. El **estado no se guarda**: se calcula de los alquileres.
- **Alquileres:** `id, casilleroId, ciclo, apellidos, nombres, codigo, celular, estado (reservado|pagado|finalizado|cancelado), reservadoEn, venceReserva, pagadoEn, monto, medio, confirmadoPor, motivo`. **Nunca se borran**: pasan a finalizado o cancelado.
- **Bitácora:** `fecha, por, accion, casilleroId, detalle`.
- Validaciones: código UNI `^\d{8}[A-Z]$` (ej. 20231234A); celular `^9\d{8}$`.

### Diseño e identidad
- Colores: **naranja** `#f0932b` con toques **morados** `#6c3fa3`; cabecera morada oscura `#241634` con borde naranja. Variables en `sitio/css/base.css` → `:root`.
- Tipografía: **Bebas Neue** (títulos; es la que el CCOA usa en Canva) + **DM Sans** (texto), desde Google Fonts.
- **Mascota:** gato naranja con casco blanco y bata (`sitio/assets/mascota.png`), en la portada y en la confirmación.
- Logo: monograma "CC" con aro naranja (`sitio/assets/logo-claro.png` para fondo oscuro).
- Estilo buscado: simple, con identidad del CCOA, que **no parezca "hecho por IA"** (sin degradados llamativos ni tarjetas genéricas).
- Redes: Instagram `@ccoafiqt.uni`, `linktr.ee/ccoafiqt.uni`, correo `ccoa.fiqt@uni.edu.pe`.

## 6. Carpetas
```
CCOA/                       (carpeta local de Paolo; NO es la de sus cursos de la UNI)
├─ CLAUDE.md                instrucciones para Claude Code
├─ PROYECTO/                ← repositorio de GitHub
│  ├─ CONTEXTO.md           ← este archivo
│  ├─ AGENTS.md             instrucciones breves para cualquier IA
│  ├─ README.md
│  ├─ sitio/                la página (lo único que se publica)
│  ├─ docs/                 notas de Obsidian (detalle por tema; empezar por "00 Inicio.md")
│  └─ .github/workflows/pagina.yml   publica sitio/ en GitHub Pages
├─ material/                originales: logo, mascota, foto de casilleros, Excel antiguo
└─ capturas/                capturas de pantalla para mostrar al equipo
```

## 7. Plan para la versión real (backend)
**Google Sheets + Google Apps Script** (gratis, sin servidor propio):
- La hoja es **privada**; solo el script la lee y escribe. La página pública solo recibe `id` y `estado`.
- El servidor **vuelve a validar todo** y usa `LockService` para que dos alumnos no tomen el mismo casillero a la vez.
- Panel de Logística con **inicio de sesión de Google** y lista blanca de correos. Por ahora el único correo es el institucional de Paolo (`@uni.pe`); los de Logística se definirán después.
- Correo de aviso a Logística por cada reserva.
- **Pedido de Paolo:** poder alquilar "por fuera" editando la hoja (casilla de verificación **Ocupado** / **Pagó** por casillero) y que la página se actualice, y al revés. Propuesta: pestaña *Casilleros* con una fila por casillero (`Casillero | Ocupado ☑ | Pagó ☑ | Apellidos | Nombres | Código | Celular | Fecha | Notas`) + pestaña *Historial*. Implica que la hoja "manda" sobre el estado (cambio respecto al modelo actual).
- Botón para **abrir/cerrar el periodo de alquiler** (fuera del periodo solo se ve el mapa y un aviso).
- Se prueba con la cuenta de Paolo y luego se copia a una cuenta del CCOA.
- Alternativa si crece: Vercel + Supabase.

Detalle: `docs/Seguridad.md`.

## 8. Publicación (GitHub)
- Cuenta de GitHub de Paolo: **grampass** (creada con su Gmail personal). Organización del CCOA: opcional, más adelante (se transfiere el repositorio con un clic).
- Repositorio previsto: `casilleros` (público, requisito de Pages gratis). La página quedaría en `https://grampass.github.io/casilleros/`.
- La publicación es automática con GitHub Actions (`.github/workflows/pagina.yml`), que **solo publica `sitio/`**. En GitHub: *Settings → Pages → Source: GitHub Actions*.
- En la computadora de Paolo están instalados **Git** y **GitHub CLI** (`gh`). El inicio de sesión se hace con un **token clásico** (permisos: `repo`, `workflow`, `read:org`; sin vencimiento), porque el inicio con código del navegador falló por cortes de conexión con `github.com`.
- **Nunca** pedir ni escribir el token en un chat.

## 9. Pendientes
**De Paolo:**
- [ ] Terminar `gh auth login` con el token → luego crear el repositorio y subir.
- [ ] QR de Yape → guardarlo como `sitio/assets/yape-qr.png` y poner `qr: 'assets/yape-qr.png'` en `config.js`.
- [ ] Lista actual de ocupantes (la tiene el secretario de Logística).
- [ ] Fotos de los casilleros (arriba/abajo, numeración real).
- [ ] Fechas del periodo de alquiler, del plazo de renovación y del fin de ciclo (`CONFIG.finDeCiclo`, hoy `2026-12-20` provisional).
- [ ] Qué casilleros exactos son del CCOA.
- [ ] ¿Pueden alquilar alumnos de otras facultades?
- [ ] Correos de Logística para el panel (por ahora solo el de Paolo).

**Técnicos:**
- [ ] Publicar en GitHub Pages.
- [ ] Backend Google Sheets + Apps Script (sección 7).
- [ ] Indicar en el mapa qué fila está arriba/abajo.
- [ ] Abrir/cerrar periodo de alquiler.
- [ ] Guía corta de uso para Logística.

## 10. Preferencias de trabajo de Paolo
- Respuestas en **español**, claras y sin tecnicismos innecesarios (no es programador).
- **Nunca borrar sus archivos** (mover o renombrar sí, avisando).
- Código **por módulos**, fácil de editar; los ajustes van en `config.js`.
- Después de cambiar código, actualizar `docs/` y este archivo.
- Mantener la documentación en Obsidian (`docs/`, notas enlazadas con `[[ ]]`).
- Pide cosas por voz: los mensajes pueden traer errores de transcripción.

## 11. Historial
- **2026-08/09:** idea inicial; Excel antiguo y foto de casilleros como referencia.
- **2026-10-08:** prototipo completo (página pública + panel + documentación). Rediseño con identidad del CCOA (mascota, Bebas Neue, sin degradados). Decididos precio S/ 14, Yape, 48 h, condiciones, prioridad de renovación. Carpeta reorganizada (`sitio/`, `docs/`, `material/`). Preparada la publicación en GitHub; Git y GitHub CLI instalados; inicio de sesión pendiente.
