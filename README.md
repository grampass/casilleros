# Casilleros CCOA

Alquiler de casilleros del Centro Cultural Óscar Almenara (FIQT · UNI), gestionado por la Secretaría de Logística.

- `CONTEXTO.md`: todo el proyecto resumido (decisiones, estado, pendientes). **Empieza aquí.**
- `sitio/`: la página (HTML, CSS y JavaScript, sin dependencias). Es lo único que se publica.
- `docs/`: notas de Obsidian. Empieza por `docs/00 Inicio.md`.
- `.github/workflows/pagina.yml`: publica `sitio/` en GitHub Pages al subir cambios a `main`.

Para probar en la computadora:

```bash
python -m http.server 8080 -d sitio
```

y abrir `http://localhost:8080`.
