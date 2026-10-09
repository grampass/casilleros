# Flujo de alquiler

Volver a [[00 Inicio]].

```
LIBRE ──(alumno reserva en la web)──▶ RESERVADO ──(Logística marca "Pagó")──▶ OCUPADO
  ▲                                       │                                     │
  │                       (pasan 48 h sin pagar: se libera solo)                │
  └───────────────────────────────────────┘                                     │
  └──────────────(Logística desmarca "Ocupado": fin de ciclo, devolución)───────┘

INHABILITADO: casillero dañado o reservado para el CCOA. Nadie lo puede pedir.
```

## Paso a paso
1. **Alumno** abre la página y ve solo el estado de cada casillero (no ve nombres).
2. Toca uno **libre**, llena apellidos, nombres, código UNI y celular, y acepta las condiciones.
3. El casillero pasa a **reservado** en ese instante: nadie más puede pedirlo.
4. Logística recibe un **correo** con los datos. La página le muestra al alumno el **QR de Yape** y un botón de WhatsApp con el mensaje ya escrito (966 378 397).
5. El alumno yapea **S/ 14** y manda la captura. **Logística** marca **Pagó** en la Google Sheet: queda **ocupado**.
6. Si no se marca *Pagó* en el plazo (*Horas para pagar* en la hoja), la reserva se libera sola.
7. Al terminar el ciclo: menú **Casilleros CCOA → Empezar nuevo ciclo…** (renovación con prioridad). Ver [[Instalar la hoja]].

## Si el alumno escribe directamente por WhatsApp
Logística llena la fila en la hoja y marca **Ocupado** y **Pagó** (dejando *Reservado el* vacío, así no vence). La página se actualiza sola.

## Reglas
- Uno por persona por ciclo (por código UNI y por celular).
- El candado lo pone cada alumno; el sistema no lo registra.
- Todo cambio queda en el **Historial** de la hoja, con ciclo y quién lo hizo.

Ver también [[Modelo de datos]] y [[Seguridad]].
