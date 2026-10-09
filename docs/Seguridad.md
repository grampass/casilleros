# Seguridad (versión real)

Volver a [[00 Inicio]].

> El prototipo **no es seguro**: guarda todo en el navegador y el panel no pide contraseña. Sirve solo para mostrar la idea.

## Propuesta: Google Sheets + Google Apps Script (gratis, sin dominio)

```
Alumno ──▶ Página pública ──▶ Apps Script (servidor) ──▶ Google Sheet privado
Logística ─▶ Panel (con cuenta Google) ──┘
```

1. **La base de datos es un Google Sheet de una cuenta Gmail del CCOA** (no de una persona), para que pase de directiva en directiva.
2. **El Sheet no se comparte con el público.** Nadie lo abre directamente; solo el servidor (Apps Script) lee y escribe.
3. **La página pública solo puede hacer dos cosas:**
   - pedir el mapa → recibe únicamente `id` y `estado`, **nunca nombres ni celulares**;
   - reservar → el servidor **vuelve a validar todo** (la validación de la página es solo comodidad; se puede saltar).
4. **Dos personas a la vez:** el servidor usa `LockService` para que, si dos alumnos tocan el mismo casillero al mismo tiempo, solo uno lo consiga.
5. **El panel de Logística exige iniciar sesión con Google.**
   - Solo entran los correos de una **lista blanca** (los de Logística), guardada en la configuración del script, no en la página.
   - Detalle técnico a confirmar al construir: con cuentas `@gmail.com`, Apps Script solo identifica al usuario si el panel se publica como "ejecutar como el usuario que accede", y eso obliga a compartir el Sheet con esos correos. Como son de Logística, es aceptable; el resto sigue sin acceso.
6. **Bitácora:** cada acción guarda quién la hizo. Si alguien "mete la mano", queda registrado.
7. **Abuso:** límite de reservas por código y por celular, y caducidad automática de reservas no pagadas.
8. **Datos personales (Ley 29733, Perú):** añadir una casilla "Acepto que el CCOA use mis datos solo para gestionar el casillero" y borrar o anonimizar los datos de ciclos antiguos.

## Alternativa si crece
Vercel (hosting gratis) + Supabase (base de datos con inicio de sesión y permisos por fila). Más potente, pero requiere alguien que lo mantenga.

Ver [[Decisiones pendientes]].
