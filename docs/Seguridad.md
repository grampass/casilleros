# Seguridad

Volver a [[00 Inicio]].

```
Alumno ──▶ Página (GitHub Pages) ──▶ Apps Script ──▶ Google Sheet privada
                                                        ▲
                               Logística edita directo ─┘
```

## Cómo está protegido hoy
1. **La hoja no se comparte con el público.** Solo la abren las cuentas que Paolo invite (Compartir → Editor). Nadie más puede ver nombres ni celulares.
2. **La página solo puede hacer dos cosas** a través de Apps Script:
   - pedir el mapa → recibe únicamente `id` y `estado` de cada casillero;
   - reservar → el servidor **vuelve a validar todo** (la validación de la página es solo comodidad).
3. **Dos alumnos a la vez:** cada reserva usa `LockService`, así que solo uno consigue el casillero.
4. **Uno por persona** por código UNI **y** por celular.
5. **Robots:** campo invisible en el formulario; si viene lleno, se rechaza.
6. **Historial:** cada reserva, pago, liberación y vencimiento queda anotado con ciclo y quién lo hizo. Si algo se borra por error: Archivo → Historial de versiones.
7. **Datos personales:** el alumno acepta las condiciones antes de reservar; los datos solo los ve Logística.
8. El repositorio de GitHub es público, pero **no contiene datos de alumnos** ni el correo de aviso (ese vive en la pestaña Configuración de la hoja).

## Riesgo conocido
Alguien podría inventar códigos y apartar varios casilleros por 48 h. Se resuelve desmarcando *Ocupado* en la hoja. Si pasa seguido: limitar reservas por hora en `servidor/Codigo.gs`.

## Alternativa si crece
Vercel + Supabase (base de datos con inicio de sesión y permisos por fila). Más potente, pero requiere alguien que lo mantenga.

Ver [[Instalar la hoja]].
