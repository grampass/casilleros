// ─────────────────────────────────────────────────────────────
// PÁGINA PÚBLICA (index.html)
// El alumno ve qué casilleros están libres, elige uno, llena sus
// datos y queda RESERVADO. Luego paga por Yape y manda la captura
// a Logística por WhatsApp.
// ─────────────────────────────────────────────────────────────

import { CONFIG } from '../config.js';
import * as api from '../datos/api.js';
import { demoSiSePide } from '../datos/demo.js';
import { dibujarMapa, leyenda } from '../ui/mapa.js';
import { abrirModal, cerrarModal } from '../ui/modal.js';
import { enlaceWhatsApp, precio, fecha, seguro, condiciones, ICONO_WHATSAPP } from '../ui/formato.js';

const $ = s => document.querySelector(s);

async function refrescar() {
  const casilleros = await api.verMapa();
  const libres = casilleros.filter(c => c.estado === 'libre').length;
  $('#contador').innerHTML = `<strong>${libres}</strong> de ${casilleros.length} casilleros libres`;
  dibujarMapa($('#mapa'), casilleros, { alElegir: pedir });
}

function pedir(casillero) {
  const d = abrirModal(`Reservar casillero ${casillero.id}`, `
    <p class="nota">Todo el ciclo <strong>${CONFIG.ciclo}</strong> por <strong>${precio()}</strong>.
       Tienes <strong class="sin-corte">${CONFIG.horasReserva} h</strong> para pagar; si no, la reserva se libera.</p>
    <form id="form-reserva" class="formulario" novalidate>
      <label>Apellidos <input name="apellidos" autocomplete="family-name" required></label>
      <label>Nombres <input name="nombres" autocomplete="given-name" required></label>
      <div class="formulario__fila">
        <label>Código UNI <input name="codigo" placeholder="20231234A" maxlength="10" required></label>
        <label>Celular <input name="celular" inputmode="numeric" placeholder="9XXXXXXXX" maxlength="11" required></label>
      </div>
      <details class="desplegable">
        <summary>Leer condiciones</summary>
        ${condiciones()}
      </details>
      <label class="check"><input type="checkbox" name="acepta" required> Acepto las condiciones y el uso de mis datos</label>
      <p class="formulario__error" id="error-general" role="alert"></p>
      <button class="boton boton--primario" type="submit">Reservar ${casillero.id}</button>
    </form>`);

  d.querySelector('#form-reserva').addEventListener('submit', async ev => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const datos = Object.fromEntries(new FormData(form));
    form.querySelectorAll('.campo-error').forEach(e => e.remove());
    form.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));

    const r = await api.reservar(casillero.id, datos);
    if (!r.ok) {
      for (const [campo, msj] of Object.entries(r.errores || {})) {
        const input = form.elements[campo];
        input.setAttribute('aria-invalid', 'true');
        const ancla = input.type === 'checkbox' ? input.closest('label') : input;
        ancla.insertAdjacentHTML('afterend', `<small class="campo-error">${msj}</small>`);
      }
      form.querySelector('#error-general').textContent = r.mensaje || '';
      if (r.mensaje) refrescar();
      return;
    }
    confirmar(r.alquiler);
    refrescar();
  });
}

function confirmar(a) {
  const { yape } = CONFIG;
  const mensaje = `Hola, soy ${a.nombres} ${a.apellidos} (código ${a.codigo}). ` +
    `Reservé el casillero ${a.casilleroId} para el ciclo ${a.ciclo}. Aquí va la captura de mi Yape.`;
  abrirModal('¡Casillero reservado!', `
    <div class="exito">
      <img class="exito__mascota" src="assets/mascota.png" alt="">
      <div class="exito__num">${seguro(a.casilleroId)}</div>
      <p>Queda apartado a tu nombre hasta el <strong>${fecha(a.venceReserva)}</strong></p>
      <div class="pago">
        <p><b>1.</b> Yapea <strong>${precio()}</strong> a <strong>${seguro(yape.titular)}</strong> · <span class="sin-corte">${seguro(yape.numero)}</span></p>
        ${yape.qr ? `<img class="pago__qr" src="${seguro(yape.qr)}" alt="QR de Yape">` : ''}
        <p><b>2.</b> Envía la captura por WhatsApp. Logística confirma tu casillero.</p>
      </div>
      <a class="boton boton--whatsapp" href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener">
        ${ICONO_WHATSAPP} Enviar captura a Logística</a>
      <button type="button" class="boton boton--texto" id="listo">Listo</button>
    </div>`).querySelector('#listo').addEventListener('click', cerrarModal);
}

function pie() {
  const r = CONFIG.redes;
  $('#redes').innerHTML = `
    <a href="${r.instagram}" target="_blank" rel="noopener">Instagram ${seguro(r.usuario)}</a>
    <a href="${r.enlaces}" target="_blank" rel="noopener">Todas nuestras redes</a>
    <a href="mailto:${r.correo}">${seguro(r.correo)}</a>`;
}

async function iniciar() {
  await demoSiSePide();
  document.querySelectorAll('[data-ciclo]').forEach(e => { e.textContent = CONFIG.ciclo; });
  $('#precio').textContent = precio();
  $('#horas').textContent = CONFIG.horasReserva;
  $('#leyenda').innerHTML = leyenda();
  $('#condiciones').innerHTML = condiciones();
  const consulta = enlaceWhatsApp('Hola, tengo una consulta sobre los casilleros del CCOA.');
  document.querySelectorAll('[data-whatsapp]').forEach(a => { a.href = consulta; });
  pie();
  refrescar();
}

iniciar();
