// ─────────────────────────────────────────────────────────────
// DATOS DE EJEMPLO (solo para presentar el prototipo)
// Se cargan abriendo cualquier página con ?demo al final de la
// dirección, por ejemplo: http://localhost:8080/logistica.html?demo
// Los nombres son inventados.
// ─────────────────────────────────────────────────────────────

import * as api from './api.js';
import { CONFIG } from '../config.js';

const EJEMPLOS = [
  // casillero, apellidos, nombres, código, celular, ¿pagó?
  ['2A',  'Quispe Rojas',   'Lucía',    '20231111A', '911111111', true],
  ['5A',  'Huamán Torres',  'Diego',    '20222222B', '922222222', true],
  ['8A',  'Flores Paredes', 'Valeria',  '20213333C', '933333333', false],
  ['12A', 'Ramos Vega',     'Andrés',   '20244444D', '944444444', true],
  ['3B',  'Castillo Díaz',  'Camila',   '20235555E', '955555555', true],
  ['7B',  'Mendoza Salas',  'Bruno',    '20226666F', '966666666', false],
  ['10B', 'Rojas Lima',     'Fernanda', '20217777G', '977777777', true],
  ['14B', 'Torres Cano',    'Mateo',    '20248888H', '988888888', true],
  ['18B', 'Vargas Ruiz',    'Sofía',    '20239999J', '999999991', true],
];

export async function cargarDemo() {
  await api.reiniciarPrototipo();
  for (const [id, apellidos, nombres, codigo, celular, pagado] of EJEMPLOS) {
    await api.asignar(id, { apellidos, nombres, codigo, celular }, { pagado, monto: CONFIG.precio ?? 0, medio: 'Yape' }, 'Franco');
  }
  await api.cambiarHabilitado('20A', false, 'Franco');
  try { localStorage.setItem('ccoa-encargado', 'Franco'); } catch { /* sin almacenamiento */ }
}

/**
 * Si la dirección termina en ?demo, carga los ejemplos y limpia la dirección.
 * Para capturas de la página pública:
 *   ?demo&abrir=9A          → abre el formulario de 9A con datos de ejemplo
 *   ?demo&abrir=9A&enviar   → además lo envía y muestra la confirmación
 */
export async function demoSiSePide() {
  const p = new URLSearchParams(location.search);
  if (!p.has('demo')) return;
  await cargarDemo();
  history.replaceState(null, '', location.pathname);
  if (p.has('abrir')) setTimeout(() => abrirConEjemplo(p.get('abrir'), p.has('enviar')), 300);
}

function abrirConEjemplo(id, enviar) {
  document.querySelector(`[aria-label^="Casillero ${id},"]`)?.click();
  const f = document.querySelector('#form-reserva');
  if (!f) return;
  f.elements.apellidos.value = 'Gutiérrez Soto';
  f.elements.nombres.value = 'Ana';
  f.elements.codigo.value = '20241234K';
  f.elements.celular.value = '912345678';
  f.elements.acepta.checked = true;
  if (enviar) f.requestSubmit();
}
