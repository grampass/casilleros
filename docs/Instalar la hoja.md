# Instalar la hoja (Google Sheet + Apps Script)

Volver a [[00 Inicio]]. Ver también [[Seguridad]] y [[Modelo de datos]].

La Google Sheet es **la base de datos y el panel de Logística**. Por ahora vive en el **Gmail personal de Paolo**; los avisos de reserva llegan a su correo institucional. Más adelante se copia a una cuenta del CCOA.

## Pasos (unos 10 minutos)
1. Entrar a **sheets.new** con el Gmail personal → se crea una hoja vacía. Ponerle de nombre `Casilleros CCOA`.
2. **Extensiones → Apps Script**. Se abre el editor.
3. Borrar lo que haya en `Código.gs` y pegar **todo** el contenido de `PROYECTO/servidor/Codigo.gs`. Guardar (ícono de disquete o Ctrl+S).
4. Volver a la hoja y **recargar la página** (F5). Aparece el menú **Casilleros CCOA**.
5. **Casilleros CCOA → 1. Configurar hoja**.
   - Google pide permisos: *Revisar permisos* → elegir la cuenta → si sale "Google no ha verificado esta app": *Configuración avanzada* → *Ir a Casilleros CCOA (no seguro)* → *Permitir*. Es normal: la "app" es el código que tú mismo pegaste.
   - Pregunta a qué correo avisar: escribir el correo institucional.
   - Se crean las pestañas **Casilleros**, **Historial** y **Configuración**.
6. En Apps Script: **Implementar → Nueva implementación**.
   - Tipo (engranaje): **Aplicación web**.
   - Descripción: `v1`.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario** (así los alumnos reservan sin iniciar sesión; solo ven estados).
   - **Implementar** → copiar la **URL de la aplicación web** (termina en `/exec`).
7. Pasarle esa URL a Claude (o ponerla en `sitio/js/config.js` → `servidor: '…/exec'`).

## Si se cambia el código del servidor después
**Implementar → Gestionar implementaciones → lápiz → Versión: Nueva versión → Implementar.** La URL no cambia.

## Uso diario (Logística)
| Quiero… | En la pestaña Casilleros |
|---|---|
| Confirmar un pago | Marcar **Pagó** |
| Alquilar "por fuera" | Llenar la fila y marcar **Ocupado** y **Pagó**. Dejar *Reservado el* vacío (así no vence) |
| Liberar un casillero | Desmarcar **Ocupado** → la fila se limpia y los datos quedan en el Historial |
| Casillero dañado o del CCOA | Marcar **Inhabilitado** (y escribir el motivo en Notas) |
| Cerrar/abrir el periodo | Pestaña Configuración → *Periodo de alquiler abierto* |
| Cambiar de ciclo | Menú **Casilleros CCOA → Empezar nuevo ciclo…** (renovación con prioridad) |

Colores: naranja = reservado (por pagar), morado = ocupado (pagado), gris = inhabilitado.

## Historial
- Cada movimiento queda con **fecha, ciclo, casillero, acción, alumno y quién lo hizo**. No se borra.
- Para filtrar por ciclo, casillero o alumno: flechitas de la fila de títulos.
- **Exportar:** Archivo → Descargar → Microsoft Excel (.xlsx) o CSV (estando en la pestaña Historial).
- Si algo se borra por error: Archivo → Historial de versiones.

## Notas técnicas
- La página pública solo recibe `id` y `estado` de cada casillero. Nombres y celulares nunca salen de la hoja.
- Cada reserva usa un candado (`LockService`) para que dos alumnos no tomen el mismo casillero.
- Las reservas hechas en la página vencen solas a las *Horas para pagar* (revisión cada hora y en cada visita).
- Uno por persona: se controla por código UNI **y** por celular.
- Ciclo, precio y horas se leen de la pestaña Configuración: la página los muestra desde ahí.
- La hoja tiene que tener los mismos bloques que `sitio/js/config.js` (constante `BLOQUES` en el código).
