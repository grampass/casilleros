// ─────────────────────────────────────────────────────────────
// ALMACÉN LOCAL (modo prueba y ?demo)
// Guarda todo en el navegador (localStorage). Sirve para probar
// la página sin servidor y para el panel de demostración.
// La versión real usa servidor.js (Google Sheet).
// ─────────────────────────────────────────────────────────────

import { generarCasilleros } from '../logica/reglas.js';

const CLAVE = 'ccoa-casilleros-prototipo-v1';

function estadoInicial() {
  return { casilleros: generarCasilleros(), alquileres: [], bitacora: [] };
}

export async function leer() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return JSON.parse(crudo);
  } catch { /* almacenamiento no disponible: se usa el estado inicial */ }
  return estadoInicial();
}

export async function guardar(estado) {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
}

export async function reiniciar() {
  const e = estadoInicial();
  await guardar(e);
  return e;
}
