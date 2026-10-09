// ─────────────────────────────────────────────────────────────
// PANEL DE LOGÍSTICA (logistica.html)
// Ver todo, confirmar pagos, asignar, liberar, inhabilitar,
// buscar alumnos, ver la bitácora y exportar a Excel (CSV).
// ⚠️ En el prototipo no hay inicio de sesión real: ver docs/Seguridad.md
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';
import * as api from '../datos/api.js';
import { demoSiSePide } from '../datos/demo.js';
import { dibujarMapa, leyenda } from '../ui/mapa.js';
import { abrirModal, cerrarModal } from '../ui/modal.js';
import { ESTADOS } from '../logica/reglas.js';
import { fecha, seguro, enlaceWhatsApp, ICONO_WHATSAPP } from '../ui/formato.js';

const $ = s => document.querySelector(s);
let datos = { casilleros: [], alquileres: [], bitacora: [] };

function encargado() {
  try { return localStorage.getItem('ccoa-encargado') || 'Logística'; } catch { return 'Logística'; }
}

async function refrescar() {
  datos = await api.verTodo();
  resumen();
  dibujarMapa($('#mapa'), datos.casilleros, { alElegir: detalle, clicables: 'todos' });
  tabla();
  bitacora();
}

// ── Resumen ──────────────────────────────────────────────────
function resumen() {
  const cuenta = k => datos.casilleros.filter(c => c.estado === k).length;
  const recaudado = datos.alquileres
    .filter(a => a.ciclo === CONFIG.ciclo && (a.estado === 'pagado' || a.estado === 'finalizado'))
    .reduce((s, a) => s + (Number(a.monto) || 0), 0);
  $('#resumen').innerHTML = [
    ['libre', 'Libres', cuenta('libre')],
    ['reservado', 'Por pagar', cuenta('reservado')],
    ['ocupado', 'Ocupados', cuenta('ocupado')],
    ['dinero', 'Recaudado', `S/ ${recaudado.toFixed(2)}`],
  ].map(([cl, t, v]) => `<div class="dato dato--${cl}"><span>${t}</span><strong>${v}</strong></div>`).join('');
}

// ── Detalle de un casillero ─────────────────────────────────
function detalle(c) {
  const a = c.alquiler;
  let html = `<p class="estado-chip estado-chip--${ESTADOS[c.estado].clase}">${ESTADOS[c.estado].texto}</p>`;

  if (a) {
    const wa = enlaceWhatsApp(`Hola ${a.nombres}, te escribimos de Logística del CCOA por el casillero ${a.casilleroId}.`, `51${a.celular}`);
    html += `
      <dl class="ficha">
        <dt>Alumno</dt><dd>${seguro(a.apellidos)}, ${seguro(a.nombres)}</dd>
        <dt>Código</dt><dd>${seguro(a.codigo)}</dd>
        <dt>Celular</dt><dd>${seguro(a.celular)} <a class="enlace-wa" href="${wa}" target="_blank" rel="noopener">${ICONO_WHATSAPP}</a></dd>
        <dt>Reservó</dt><dd>${fecha(a.reservadoEn)}</dd>
        ${a.estado === 'reservado'
          ? `<dt>Vence reserva</dt><dd>${fecha(a.venceReserva)}</dd>`
          : `<dt>Pagó</dt><dd>${fecha(a.pagadoEn)} · S/ ${seguro(a.monto)} · ${seguro(a.medio)}</dd>
             <dt>Confirmó</dt><dd>${seguro(a.confirmadoPor)}</dd>`}
      </dl>`;
  }

  if (c.estado === 'reservado') html += formPago();
  if (c.estado === 'libre') html += formAsignar();

  html += `<div class="acciones">
    ${a ? `<button class="boton boton--peligro" data-accion="liberar">Liberar casillero</button>` : ''}
    ${c.estado === 'libre' ? `<button class="boton boton--texto" data-accion="inhabilitar">Marcar como inhabilitado</button>` : ''}
    ${c.estado === 'inhabilitado' ? `<button class="boton boton--primario" data-accion="habilitar">Habilitar</button>` : ''}
  </div><p class="formulario__error" id="error-panel" role="alert"></p>`;

  const d = abrirModal(`Casillero ${c.id}`, html);
  const error = msj => { d.querySelector('#error-panel').textContent = msj; };
  const hecho = async r => { if (r.ok) { cerrarModal(); refrescar(); } else error(r.mensaje || 'Revisa los datos.'); };

  d.querySelector('#form-pago')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget));
    hecho(await api.confirmarPago(c.id, { monto: Number(f.monto), medio: f.medio }, encargado()));
  });

  d.querySelector('#form-asignar')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget));
    const r = await api.asignar(c.id, f, { pagado: f.pagado === 'on', monto: Number(f.monto), medio: f.medio }, encargado());
    if (r.errores) return error(Object.values(r.errores).join(' '));
    hecho(r);
  });

  d.querySelector('[data-accion="liberar"]')?.addEventListener('click', async () => {
    const motivo = prompt('Motivo (ej. fin de ciclo, no pagó, lo devolvió):', 'Fin de ciclo');
    if (motivo !== null) hecho(await api.liberar(c.id, motivo || 'Sin motivo', encargado()));
  });
  d.querySelector('[data-accion="inhabilitar"]')?.addEventListener('click', async () =>
    hecho(await api.cambiarHabilitado(c.id, false, encargado())));
  d.querySelector('[data-accion="habilitar"]')?.addEventListener('click', async () =>
    hecho(await api.cambiarHabilitado(c.id, true, encargado())));
}

const camposPago = `
  <div class="formulario__fila">
    <label>Monto (S/) <input name="monto" type="number" min="0" step="0.5" value="${CONFIG.precio ?? ''}" required></label>
    <label>Medio <select name="medio"><option>Yape</option><option>Plin</option><option>Efectivo</option></select></label>
  </div>`;

function formPago() {
  return `<form id="form-pago" class="formulario formulario--caja">
    <h4>Confirmar pago</h4>${camposPago}
    <button class="boton boton--primario" type="submit">Confirmar pago</button></form>`;
}

function formAsignar() {
  return `<form id="form-asignar" class="formulario formulario--caja">
    <h4>Asignar a un alumno</h4>
    <div class="formulario__fila">
      <label>Apellidos <input name="apellidos" required></label>
      <label>Nombres <input name="nombres" required></label>
    </div>
    <div class="formulario__fila">
      <label>Código UNI <input name="codigo" placeholder="20231234A" required></label>
      <label>Celular <input name="celular" placeholder="9XXXXXXXX" required></label>
    </div>
    <label class="check"><input type="checkbox" name="pagado" checked> Ya pagó</label>
    ${camposPago}
    <button class="boton boton--primario" type="submit">Asignar</button></form>`;
}

// ── Tabla de alquileres ─────────────────────────────────────
function tabla() {
  const q = $('#buscar').value.trim().toLowerCase();
  const filtro = $('#filtro').value;
  const filas = datos.alquileres
    .filter(a => a.ciclo === CONFIG.ciclo)
    .filter(a => filtro === 'todos' || a.estado === filtro)
    .filter(a => !q || `${a.apellidos} ${a.nombres} ${a.codigo} ${a.casilleroId}`.toLowerCase().includes(q))
    .sort((x, y) => x.casilleroId.localeCompare(y.casilleroId, 'es', { numeric: true }));

  $('#tabla').innerHTML = filas.length ? `
    <table>
      <thead><tr><th>Casillero</th><th>Alumno</th><th>Código</th><th>Celular</th><th>Estado</th><th>Fecha</th></tr></thead>
      <tbody>${filas.map(a => `
        <tr>
          <td><b>${seguro(a.casilleroId)}</b></td>
          <td>${seguro(a.apellidos)}, ${seguro(a.nombres)}</td>
          <td>${seguro(a.codigo)}</td>
          <td>${seguro(a.celular)}</td>
          <td><span class="estado-chip estado-chip--${a.estado}">${a.estado}</span></td>
          <td>${fecha(a.pagadoEn || a.reservadoEn)}</td>
        </tr>`).join('')}</tbody>
    </table>` : `<p class="vacio">No hay alquileres que coincidan.</p>`;
}

function bitacora() {
  $('#bitacora').innerHTML = datos.bitacora.slice(0, 30).map(b => `
    <li><time>${fecha(b.fecha)}</time> <b>${seguro(b.por)}</b> · ${seguro(b.accion)} <b>${seguro(b.casilleroId)}</b>
      ${b.detalle ? `<span>${seguro(b.detalle)}</span>` : ''}</li>`).join('') || '<li class="vacio">Sin movimientos todavía.</li>';
}

// ── Inicio ───────────────────────────────────────────────────
async function descargarCSV() {
  const csv = await api.exportarCSV();
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: `casilleros-${CONFIG.ciclo}.csv` }).click();
  URL.revokeObjectURL(url);
}

async function iniciar() {
  await demoSiSePide();
  $('#ciclo').textContent = CONFIG.ciclo;
  $('#leyenda').innerHTML = leyenda();
  $('#encargado').value = encargado();
  $('#encargado').addEventListener('change', e => { try { localStorage.setItem('ccoa-encargado', e.target.value.trim()); } catch {} });
  $('#buscar').addEventListener('input', tabla);
  $('#filtro').addEventListener('change', tabla);
  $('#exportar').addEventListener('click', descargarCSV);
  $('#reiniciar').addEventListener('click', async () => {
    if (confirm('¿Borrar todos los datos de PRUEBA del prototipo?')) { await api.reiniciarPrototipo(); refrescar(); }
  });
  refrescar();
}

iniciar();
