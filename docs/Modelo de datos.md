# Modelo de datos

Volver a [[00 Inicio]]. En la versión real, cada tabla será una hoja del Google Sheet.

## Casilleros
| Campo | Ejemplo | Nota |
|---|---|---|
| id | `7B` | número + bloque |
| bloque | `B` | A = dentro del CCOA, B = fuera |
| numero | `7` | |
| habilitado | `true` | false = dañado / uso del CCOA |

El **estado** (libre, reservado, ocupado, inhabilitado) no se guarda: se calcula a partir de los alquileres. Así nunca queda desincronizado.

## Alquileres
| Campo | Ejemplo |
|---|---|
| id | identificador único |
| casilleroId | `7B` |
| ciclo | `2026-2` |
| apellidos, nombres | |
| codigo | `20231234A` |
| celular | `9XXXXXXXX` |
| estado | `reservado` · `pagado` · `finalizado` · `cancelado` |
| reservadoEn, venceReserva, pagadoEn | fechas |
| monto, medio | `14`, `Yape` |
| confirmadoPor | nombre del encargado |
| motivo | por qué se liberó o canceló |

Los alquileres **no se borran**: al liberar pasan a `finalizado` o `cancelado`. Así queda el historial de cada casillero.

## Bitácora
| Campo | Ejemplo |
|---|---|
| fecha | |
| por | `Paolo` / `Sistema` / `Ana (alumno)` |
| accion | Reservó, Confirmó pago, Asignó, Liberó, Inhabilitó… |
| casilleroId | `7B` |
| detalle | |

Ver [[Flujo de alquiler]].
