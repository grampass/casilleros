// ─────────────────────────────────────────────────────────────
// CONEXIÓN CON EL SERVIDOR REAL (Google Apps Script + Google Sheet)
// Solo lo usa api.js cuando CONFIG.servidor tiene la dirección
// de la aplicación web. El código del servidor está en servidor/Codigo.gs.
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';

/** Mapa + ajustes del ciclo (ciclo, precio, horas, abierto). */
export async function verMapa() {
  const r = await fetch(`${CONFIG.servidor}?t=${Date.now()}`);
  const d = await r.json();
  if (!d.ok) throw new Error(d.mensaje || 'El servidor no respondió bien.');
  return d;
}

/**
 * Se envía como texto plano para que el navegador no haga una
 * consulta previa (CORS) que Apps Script no sabe responder.
 */
export async function reservar(casilleroId, datos) {
  const r = await fetch(CONFIG.servidor, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ accion: 'reservar', casilleroId, ...datos }),
  });
  return r.json();
}
