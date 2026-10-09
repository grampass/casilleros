---
proyecto: Casilleros CCOA
estado: prototipo
actualizado: 2026-10-08
---

# Casilleros CCOA: mapa del proyecto

Sistema para que la **Secretaría de Logística** del Centro Cultural Óscar Almenara (UNI) alquile los casilleros por ciclo sin desorden.

## Qué hay hoy (prototipo)
- `sitio/index.html`: **página pública**. El alumno ve el mapa, elige un casillero libre, llena sus datos, acepta las condiciones y queda reservado; luego yapea y manda la captura por WhatsApp.
- `sitio/logistica.html`: **panel de Logística**. Confirmar pagos, asignar, liberar, inhabilitar, buscar, bitácora, exportar a Excel.
- Los datos se guardan **solo en el navegador** (es para probar). Ver [[Seguridad]] para la versión real.

> Resumen completo en un solo archivo (para pasarle el proyecto a otra IA o persona): `PROYECTO/CONTEXTO.md`.

## Notas
- [[Flujo de alquiler]]: cómo pasa un casillero de libre → reservado → ocupado.
- [[Módulos]]: qué hace cada archivo y dónde se cambia cada cosa.
- [[Modelo de datos]]: qué se guarda de cada casillero y alquiler.
- [[Seguridad]]: cómo se protege la base de datos en la versión real.
- [[Decisiones pendientes]]: lo decidido y lo que falta definir.
- [[Levantamiento]]: qué anotar en la visita a los casilleros.
- [[Puesta en marcha]]: qué falta entregar, dónde se aloja, GitHub e identidad visual.

## Carpetas
```
PROYECTO/   (repositorio)
├─ sitio/     página: index.html, logistica.html, css/, js/, assets/
├─ docs/      estas notas (abrir como bóveda de Obsidian)
└─ .github/   publicación automática de sitio/ en GitHub Pages
```
Fuera del repositorio, en `CCOA/`: `material/` (logo, mascota, foto y Excel originales) y `capturas/`.

## Cómo abrirlo
Las páginas usan módulos de JavaScript, así que no se abren con doble clic: hay que servirlas.

```bash
python -m http.server 8080 -d "C:\Users\paoli\OneDrive\Escritorio\CCOA\PROYECTO\sitio"
```

Luego entrar a `http://localhost:8080` (público) y `http://localhost:8080/logistica.html` (panel). Con `?demo` al final se cargan datos de ejemplo.
