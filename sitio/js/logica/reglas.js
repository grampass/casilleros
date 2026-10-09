// ─────────────────────────────────────────────────────────────
// REGLAS DEL NEGOCIO
// Validaciones y estados. No sabe nada de pantallas ni de dónde
// se guardan los datos: solo decide qué está permitido.
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';

export const ESTADOS = {
  libre:        { texto: 'Libre',        clase: 'libre' },
  reservado:    { texto: 'Reservado',    clase: 'reservado' },
  ocupado:      { texto: 'Ocupado',      clase: 'ocupado' },
  inhabilitado: { texto: 'Inhabilitado', clase: 'inhabilitado' },
};

// Código UNI: 8 dígitos + 1 letra (ej. 20231234A).
export function limpiarCodigo(codigo) {
  return String(codigo || '').replace(/\s+/g, '').toUpperCase();
}

export function validarSolicitud(datos) {
  const errores = {};
  if (!datos.apellidos?.trim()) errores.apellidos = 'Escribe tus apellidos.';
  if (!datos.nombres?.trim())   errores.nombres = 'Escribe tus nombres.';
  if (!/^\d{8}[A-Z]$/.test(limpiarCodigo(datos.codigo)))
    errores.codigo = 'El código UNI tiene 8 números y una letra (ej. 20231234A).';
  if (!/^9\d{8}$/.test(String(datos.celular || '').replace(/\D/g, '')))
    errores.celular = 'Celular de 9 dígitos que empiece con 9.';
  return errores;
}

// Reserva desde la página pública: además debe aceptar las condiciones.
export function validarReserva(datos) {
  const errores = validarSolicitud(datos);
  if (!datos.acepta) errores.acepta = 'Debes aceptar las condiciones para reservar.';
  return errores;
}

// ¿Esta persona ya tiene un casillero activo en el ciclo?
export function yaTieneCasillero(alquileres, codigo) {
  if (!CONFIG.unoPorPersona) return null;
  const c = limpiarCodigo(codigo);
  return alquileres.find(a =>
    a.ciclo === CONFIG.ciclo &&
    limpiarCodigo(a.codigo) === c &&
    (a.estado === 'reservado' || a.estado === 'pagado')
  ) || null;
}

export function reservaVencida(alquiler, ahora = Date.now()) {
  return alquiler.estado === 'reservado' && new Date(alquiler.venceReserva).getTime() < ahora;
}

export function calcularVenceReserva(desde = new Date()) {
  return new Date(desde.getTime() + CONFIG.horasReserva * 3600 * 1000).toISOString();
}

// Genera la lista de casilleros a partir de la disposición en config.js.
export function generarCasilleros() {
  const lista = [];
  for (const b of CONFIG.bloques) {
    const total = b.columnas * b.filas;
    for (let n = 1; n <= total; n++) {
      lista.push({ id: `${n}${b.id}`, bloque: b.id, numero: n, estado: 'libre', habilitado: true });
    }
  }
  return lista;
}

// Posición (fila, columna) en la cuadrícula según el orden de numeración.
export function posicion(bloque, numero) {
  const i = numero - 1;
  return bloque.orden === 'columnas'
    ? { fila: i % bloque.filas, columna: Math.floor(i / bloque.filas) }
    : { fila: Math.floor(i / bloque.columnas), columna: i % bloque.columnas };
}
