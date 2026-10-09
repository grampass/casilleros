# Flujo de alquiler

Volver a [[00 Inicio]].

```
LIBRE ──(alumno reserva en la web)──▶ RESERVADO ──(Logística confirma pago)──▶ OCUPADO
  ▲                                       │                                     │
  │                       (pasan 48 h sin pagar: se libera solo)                │
  └───────────────────────────────────────┘                                     │
  └──────────────────────(Logística libera: fin de ciclo, devolución)───────────┘

INHABILITADO: casillero dañado o reservado para el CCOA. Nadie lo puede pedir.
```

## Paso a paso
1. **Alumno** abre la página pública y ve solo el estado de cada casillero (no ve nombres).
2. Toca uno **libre** y llena apellidos, nombres, código UNI y celular.
3. El casillero pasa a **reservado** en ese instante: nadie más puede pedirlo. Esto resuelve el problema del Google Forms.
4. La página le muestra un botón de WhatsApp con el mensaje ya escrito al número de Logística (966 378 397).
5. **Logística** cobra (Yape, Plin o efectivo) y en el panel pulsa **Confirmar pago**: queda **ocupado** hasta fin de ciclo.
6. Si no paga en el plazo (`horasReserva` en `config.js`), la reserva se cancela sola.
7. Al terminar el ciclo, Logística **libera** los casilleros (o los renueva).

## Si el alumno escribe directamente por WhatsApp
Logística toca el casillero libre en el panel → **Asignar a un alumno** → marca "Ya pagó". Queda ocupado y registrado igual.

## Reglas
- Uno por persona por ciclo (por código UNI). Ver `js/logica/reglas.js`.
- El candado lo pone cada alumno; el sistema no lo registra.
- Todo cambio queda en la **bitácora** con quién lo hizo.

Ver también [[Modelo de datos]] y [[Seguridad]].
