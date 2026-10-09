// ─────────────────────────────────────────────────────────────
// MAPA DE CASILLEROS
// Dibuja cada bloque como se ve en la realidad. Lo usan las dos
// páginas: el público y el panel de Logística.
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';
import { ESTADOS, posicion } from '../logica/reglas.js';

/**
 * @param {HTMLElement} contenedor
 * @param {Array} casilleros  [{id, bloque, numero, estado}]
 * @param {Object} opciones   { alElegir(casillero), clicables: ['libre'] | 'todos' }
 */
export function dibujarMapa(contenedor, casilleros, { alElegir, clicables = ['libre'] } = {}) {
  contenedor.innerHTML = '';
  for (const bloque of CONFIG.bloques) {
    const delBloque = casilleros.filter(c => c.bloque === bloque.id);
    const libres = delBloque.filter(c => c.estado === 'libre').length;

    const seccion = document.createElement('section');
    seccion.className = 'bloque';
    seccion.innerHTML = `
      <header class="bloque__cab">
        <h3>Bloque ${bloque.id} <span>· ${bloque.nombre}</span></h3>
        <p class="bloque__libres">${libres} libre${libres === 1 ? '' : 's'}</p>
      </header>
      <div class="rejilla" style="--columnas:${bloque.columnas}"></div>`;
    const rejilla = seccion.querySelector('.rejilla');

    for (const c of delBloque) {
      const { fila, columna } = posicion(bloque, c.numero);
      const puede = clicables === 'todos' || clicables.includes(c.estado);
      const el = document.createElement(puede ? 'button' : 'div');
      el.className = `casillero casillero--${ESTADOS[c.estado].clase}`;
      el.style.gridRow = fila + 1;
      el.style.gridColumn = columna + 1;
      el.innerHTML = `<span class="casillero__rejillas" aria-hidden="true"></span>
                      <span class="casillero__num">${c.id}</span>`;
      el.title = `${c.id} · ${ESTADOS[c.estado].texto}`;
      el.setAttribute('aria-label', `Casillero ${c.id}, ${ESTADOS[c.estado].texto}`);
      if (puede) { el.type = 'button'; el.addEventListener('click', () => alElegir?.(c)); }
      rejilla.appendChild(el);
    }
    contenedor.appendChild(seccion);
  }
}

export function leyenda() {
  return Object.values(ESTADOS)
    .map(e => `<span class="leyenda__item"><i class="punto punto--${e.clase}"></i>${e.texto}</span>`)
    .join('');
}
