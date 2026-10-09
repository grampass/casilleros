# Instrucciones para asistentes de IA

1. **Lee primero `CONTEXTO.md`**: tiene todo lo decidido, el estado actual y los pendientes.
2. Para el detalle de cada tema, revisa las notas en `docs/` (empieza por `docs/00 Inicio.md`).
3. Responde y escribe código en **español**. El responsable (Paolo) no es programador: explica sin tecnicismos.
4. **No borres archivos.** Código por módulos, sin dependencias ni compilación; los ajustes van en `sitio/js/config.js`.
5. La página se prueba con `python -m http.server 8080 -d sitio`.
6. Al terminar un cambio, actualiza `docs/` y la sección de historial y pendientes de `CONTEXTO.md`.
7. Nunca pidas contraseñas ni tokens en el chat.
