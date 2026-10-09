// ─────────────────────────────────────────────────────────────
// VENTANA EMERGENTE (modal) reutilizable
// ─────────────────────────────────────────────────────────────

let dialogo;

function asegurar() {
  if (dialogo) return dialogo;
  dialogo = document.createElement('dialog');
  dialogo.className = 'modal';
  dialogo.addEventListener('click', e => { if (e.target === dialogo) cerrarModal(); });
  document.body.appendChild(dialogo);
  return dialogo;
}

/** Abre el modal con el HTML dado y devuelve el elemento para enlazar eventos. */
export function abrirModal(titulo, html) {
  const d = asegurar();
  d.innerHTML = `
    <div class="modal__caja">
      <header class="modal__cab">
        <h2>${titulo}</h2>
        <button type="button" class="modal__cerrar" aria-label="Cerrar">×</button>
      </header>
      <div class="modal__cuerpo">${html}</div>
    </div>`;
  d.querySelector('.modal__cerrar').addEventListener('click', cerrarModal);
  if (!d.open) d.showModal();
  return d;
}

export function cerrarModal() {
  dialogo?.close();
}
