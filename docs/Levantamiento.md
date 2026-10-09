# Levantamiento en la visita

Volver a [[00 Inicio]]. Lo que hay que anotar para que el mapa sea igual al real.

## Por bloque (A: dentro del CCOA · B: fuera)
- [ ] Cuántas **columnas** (a lo largo) y cuántas **filas** (a lo alto).
- [ ] Cómo va la numeración: ¿1, 2, 3… de izquierda a derecha por fila, o de arriba abajo por columna?
- [ ] ¿Hay casilleros de distinto tamaño?
- [ ] Foto **de frente** de cada bloque.

## Por casillero
- [ ] ¿El número pegado coincide con el registro?
- [ ] ¿Está dañado (puerta, bisagra, sin número)? → se marca inhabilitado.

## Preguntas al equipo
Ver [[Decisiones pendientes]].

## Dónde se carga
En `sitio/js/config.js` → `bloques` (cómo se dibuja):

```js
{ id: 'A', nombre: 'Dentro del CCOA', columnas: 5, filas: 4, orden: 'filas' },
```

Si cambia **la cantidad** de casilleros, también hay que cambiar `BLOQUES` en `servidor/Codigo.gs` y agregar las filas en la hoja.
