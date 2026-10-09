// ─────────────────────────────────────────────────────────────
// API DE DATOS
// Única puerta de entrada a los datos. Las pantallas solo llaman
// a estas funciones; nunca leen el almacén directamente.
//
//   Público:    verMapa(), reservar()
//   Logística:  verTodo(), confirmarPago(), liberar(),
//               cambiarHabilitado(), exportarCSV()
//
// Si CONFIG.servidor tiene la dirección de Apps Script, las funciones
// públicas van al servidor real (Google Sheet). Si está vacío, o la
// dirección lleva ?demo, todo se guarda en este navegador (prueba).
// Las funciones de Logística son solo del prototipo: en la versión
// real, el panel de Logística es la propia Google Sheet.
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';
import * as almacen from './almacen-local.js';
import * as servidor from './servidor.js';

// Se decide al cargar (antes de que demo.js limpie la dirección).
export const REMOTO = Boolean(CONFIG.servidor) && !new URLSearchParams(location.search).has('demo');
import {
  validarReserva, yaTieneCasillero, reservaVencida,
  calcularVenceReserva, limpiarCodigo,
} from '../logica/reglas.js';

// Lee el estado y libera las reservas que pasaron su plazo.
async function cargar() {
  const e = await almacen.leer();
  let cambio = false;
  for (const a of e.alquileres) {
    if (reservaVencida(a)) {
      a.estado = 'cancelado';
      a.motivo = 'Reserva sin pago vencida';
      registrar(e, 'Sistema', 'Reserva vencida', a.casilleroId, `${a.apellidos}, ${a.nombres}`);
      cambio = true;
    }
  }
  if (cambio) await almacen.guardar(e);
  return e;
}

function registrar(e, por, accion, casilleroId, detalle = '') {
  e.bitacora.unshift({ fecha: new Date().toISOString(), por, accion, casilleroId, detalle });
}

function alquilerActivo(e, casilleroId) {
  return e.alquileres.find(a =>
    a.casilleroId === casilleroId && a.ciclo === CONFIG.ciclo &&
    (a.estado === 'reservado' || a.estado === 'pagado'));
}

function estadoDe(e, c) {
  if (!c.habilitado) return 'inhabilitado';
  const a = alquilerActivo(e, c.id);
  if (!a) return 'libre';
  return a.estado === 'pagado' ? 'ocupado' : 'reservado';
}

// ── Público ──────────────────────────────────────────────────

// Solo id y estado: el público nunca recibe datos personales.
// Devuelve { casilleros, abierto } y, desde el servidor, también ciclo, precio y horas.
export async function verMapa() {
  if (REMOTO) return servidor.verMapa();
  const e = await cargar();
  return {
    abierto: true,
    casilleros: e.casilleros.map(c => ({ id: c.id, bloque: c.bloque, numero: c.numero, estado: estadoDe(e, c) })),
  };
}

export async function reservar(casilleroId, datos) {
  // Se valida aquí para mostrar errores al instante; el servidor vuelve a validar.
  const errores = validarReserva(datos);
  if (Object.keys(errores).length) return { ok: false, errores };
  if (REMOTO) return servidor.reservar(casilleroId, datos);
  return reservarLocal(casilleroId, datos);
}

async function reservarLocal(casilleroId, datos) {
  const e = await cargar();
  const c = e.casilleros.find(x => x.id === casilleroId);
  if (!c || estadoDe(e, c) !== 'libre')
    return { ok: false, mensaje: 'Ese casillero acaba de ser tomado. Elige otro, por favor.' };

  const previo = yaTieneCasillero(e.alquileres, datos.codigo);
  if (previo)
    return { ok: false, mensaje: `Ya tienes el casillero ${previo.casilleroId} este ciclo. Solo se permite uno por persona.` };

  const alquiler = {
    id: crypto.randomUUID(),
    casilleroId,
    ciclo: CONFIG.ciclo,
    apellidos: datos.apellidos.trim(),
    nombres: datos.nombres.trim(),
    codigo: limpiarCodigo(datos.codigo),
    celular: String(datos.celular).replace(/\D/g, ''),
    estado: 'reservado',
    reservadoEn: new Date().toISOString(),
    venceReserva: calcularVenceReserva(),
  };
  e.alquileres.push(alquiler);
  registrar(e, `${alquiler.nombres} (alumno)`, 'Reservó', casilleroId);
  await almacen.guardar(e);
  return { ok: true, alquiler };
}

// ── Logística ────────────────────────────────────────────────

export async function verTodo() {
  const e = await cargar();
  const casilleros = e.casilleros.map(c => ({ ...c, estado: estadoDe(e, c), alquiler: alquilerActivo(e, c.id) || null }));
  return { casilleros, alquileres: e.alquileres, bitacora: e.bitacora };
}

export async function confirmarPago(casilleroId, { monto, medio }, por) {
  const e = await cargar();
  const a = alquilerActivo(e, casilleroId);
  if (!a || a.estado !== 'reservado') return { ok: false, mensaje: 'No hay una reserva pendiente en este casillero.' };
  Object.assign(a, { estado: 'pagado', pagadoEn: new Date().toISOString(), monto, medio, confirmadoPor: por });
  registrar(e, por, 'Confirmó pago', casilleroId, `${a.apellidos}, ${a.nombres} · S/ ${monto} · ${medio}`);
  await almacen.guardar(e);
  return { ok: true };
}

// Asignación directa (cuando el alumno escribe por WhatsApp y Logística lo registra).
export async function asignar(casilleroId, datos, { pagado, monto, medio }, por) {
  // Logística registra en persona: las condiciones se explican al alumno ahí mismo.
  const errores = validarReserva({ ...datos, acepta: true });
  if (Object.keys(errores).length) return { ok: false, errores };
  const r = await reservarLocal(casilleroId, datos);
  if (!r.ok) return r;
  const e = await almacen.leer();
  e.bitacora[0].por = por;
  e.bitacora[0].accion = 'Asignó';
  await almacen.guardar(e);
  if (pagado) return confirmarPago(casilleroId, { monto, medio }, por);
  return r;
}

export async function liberar(casilleroId, motivo, por) {
  const e = await cargar();
  const a = alquilerActivo(e, casilleroId);
  if (!a) return { ok: false, mensaje: 'El casillero ya está libre.' };
  a.estado = a.estado === 'pagado' ? 'finalizado' : 'cancelado';
  a.motivo = motivo;
  registrar(e, por, 'Liberó', casilleroId, `${a.apellidos}, ${a.nombres} · ${motivo}`);
  await almacen.guardar(e);
  return { ok: true };
}

export async function cambiarHabilitado(casilleroId, habilitado, por) {
  const e = await cargar();
  const c = e.casilleros.find(x => x.id === casilleroId);
  if (!habilitado && alquilerActivo(e, casilleroId))
    return { ok: false, mensaje: 'Primero libera el casillero.' };
  c.habilitado = habilitado;
  registrar(e, por, habilitado ? 'Habilitó' : 'Inhabilitó', casilleroId);
  await almacen.guardar(e);
  return { ok: true };
}

export async function exportarCSV() {
  const { alquileres } = await verTodo();
  const cols = ['casilleroId', 'ciclo', 'apellidos', 'nombres', 'codigo', 'celular', 'estado', 'reservadoEn', 'pagadoEn', 'monto', 'medio', 'confirmadoPor', 'motivo'];
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...alquileres.map(a => cols.map(k => esc(a[k])).join(','))].join('\n');
}

export async function reiniciarPrototipo() {
  await almacen.reiniciar();
}
