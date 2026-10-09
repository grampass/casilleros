// ─────────────────────────────────────────────────────────────
// UTILIDADES DE FORMATO Y WHATSAPP
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';

export function fecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function precio() {
  if (CONFIG.precio == null) return 'a confirmar';
  return `S/ ${Number.isInteger(CONFIG.precio) ? CONFIG.precio : CONFIG.precio.toFixed(2)}`;
}

/** Lista de condiciones de config.js, con {horas} reemplazado. */
export function condiciones() {
  return `<ol class="condiciones">${CONFIG.condiciones
    .map(t => `<li>${seguro(t.replace('{horas}', CONFIG.horasReserva))}</li>`).join('')}</ol>`;
}

/** Enlace wa.me con mensaje ya escrito. Sin API ni costo. */
export function enlaceWhatsApp(mensaje, numero = CONFIG.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Evita que un texto escrito por el usuario se interprete como HTML. */
export function seguro(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export const ICONO_WHATSAPP = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z"/></svg>`;
