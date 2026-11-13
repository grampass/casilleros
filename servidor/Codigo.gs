/* ─────────────────────────────────────────────────────────────
   CASILLEROS CCOA · SERVIDOR (Google Apps Script)
   Va pegado dentro de la Google Sheet: Extensiones → Apps Script.

   La hoja es la base de datos Y el panel de Logística:
     · Casilleros     → una fila por casillero, con casillas Ocupado / Pagó / Inhabilitado,
                        la fecha en que se confirmó el pago y un enlace para escribir al alumno.
     · Historial      → se llena solo; nunca se borra. Solo el dueño de la hoja puede editarlo.
     · Configuración  → ciclo, precio, horas para pagar, periodo abierto, correo de aviso
                        y a quién se yapea (la página lo muestra desde aquí).

   La página pública solo puede:
     · pedir el mapa   → recibe id y estado, NUNCA nombres ni celulares;
     · reservar        → aquí se vuelve a validar todo, con candado (LockService)
                         para que dos alumnos no tomen el mismo casillero.
   ───────────────────────────────────────────────────────────── */

const HOJAS = { casilleros: 'Casilleros', historial: 'Historial', config: 'Configuración' };

// Columnas de la pestaña Casilleros (1 = A)
const C = { casillero: 1, bloque: 2, ocupado: 3, pago: 4, inhabilitado: 5,
            apellidos: 6, nombres: 7, codigo: 8, celular: 9, reservado: 10, notas: 11,
            pagadoEl: 12, escribir: 13 };
const ENCABEZADOS = ['Casillero', 'Bloque', 'Ocupado', 'Pagó', 'Inhabilitado',
                     'Apellidos', 'Nombres', 'Código UNI', 'Celular', 'Reservado el', 'Notas',
                     'Pagó el', 'WhatsApp'];
const HISTORIAL = ['Fecha', 'Ciclo', 'Casillero', 'Acción', 'Apellidos', 'Nombres',
                   'Código UNI', 'Celular', 'Por', 'Detalle'];

// Debe coincidir con sitio/js/config.js → bloques
const BLOQUES = [
  { id: 'A', total: 20, nombre: 'Dentro del CCOA' },
  { id: 'B', total: 20, nombre: 'Fuera del CCOA' },
  { id: 'C', total: 20, nombre: 'Dentro del CCOA' },
];

// Ajustes de la pestaña Configuración: [texto en la hoja, valor inicial, explicación]
// El orden importa: cada ajuste ocupa su fila. Los nuevos van siempre al final.
const AJUSTES = {
  ciclo:       ['Ciclo', '2026-2', 'Ciclo académico vigente. Se anota en cada movimiento del historial.'],
  precio:      ['Precio (S/)', 14, 'Precio del alquiler por ciclo.'],
  horas:       ['Horas para pagar', 48, 'Si una reserva hecha en la página no se marca como Pagó en este tiempo, se libera sola.'],
  abierto:     ['Periodo de alquiler abierto', true, 'Desmarcado: la página muestra el mapa pero no deja reservar.'],
  avisar:      ['Avisar reservas a', '', 'Correo(s) que reciben un aviso por cada reserva (separa varios con coma).'],
  uno:         ['Uno por persona', true, 'Impide que un mismo código o celular tenga dos casilleros.'],
  yapeTitular: ['Yape: a nombre de', 'Alexander Guillen Olivera', 'Titular del Yape que muestra la página. El QR se cambia en la página (sitio/assets/yape-qr.png).'],
  yapeNumero:  ['Yape: número', '969 058 688', 'Número del Yape que muestra la página. Vacío = no se muestra.'],
};

// Mensaje del enlace "WhatsApp" de cada fila (el nombre y el casillero se ponen solos)
const MENSAJE_WHATSAPP = 'Hola %NOMBRE%, te escribe Logística del CCOA sobre tu casillero %CASILLERO%.';

// ── Menú de la hoja ─────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Casilleros CCOA')
    .addItem('1. Configurar hoja', 'configurar')
    .addSeparator()
    .addItem('Empezar nuevo ciclo…', 'nuevoCiclo')
    .addItem('Liberar reservas vencidas ahora', 'vencerReservasMenu')
    .addToUi();
}

// ── Configuración (primera vez, o para aplicar cambios del código) ──
function configurar() {
  const ui = SpreadsheetApp.getUi();
  const libro = SpreadsheetApp.getActive();

  if (libro.getSheetByName(HOJAS.casilleros)) {
    const r = ui.alert('La hoja ya está configurada',
      '¿Volver a aplicar formatos, protecciones y agregar lo que falte? No se borra ningún dato.', ui.ButtonSet.YES_NO);
    if (r !== ui.Button.YES) return;
  }

  // Pestaña Configuración: crea la que falte y agrega al final los ajustes nuevos
  let conf = libro.getSheetByName(HOJAS.config);
  const nuevaConf = !conf;
  if (!conf) {
    conf = libro.insertSheet(HOJAS.config);
    conf.getRange(1, 1, 1, 3).setValues([['Ajuste', 'Valor', 'Para qué sirve']]);
  }
  conf.getRange(filaAjuste_('ciclo'), 2).setNumberFormat('@');      // si no, "2026-2" se vuelve fecha
  conf.getRange(filaAjuste_('yapeNumero'), 2).setNumberFormat('@');
  Object.keys(AJUSTES).forEach(k => {
    const fila = filaAjuste_(k);
    if (!conf.getRange(fila, 1).getValue()) conf.getRange(fila, 1, 1, 3).setValues([AJUSTES[k]]);
  });
  if (nuevaConf) {
    const correo = ui.prompt('Aviso de reservas', '¿A qué correo aviso cada reserva? (puedes dejarlo vacío)', ui.ButtonSet.OK);
    conf.getRange(filaAjuste_('avisar'), 2).setValue(correo.getResponseText().trim());
  }
  conf.getRange(filaAjuste_('abierto'), 2).insertCheckboxes();
  conf.getRange(filaAjuste_('uno'), 2).insertCheckboxes();
  conf.getRange('A1:C1').setFontWeight('bold').setBackground('#241634').setFontColor('#ffffff');
  conf.setColumnWidth(1, 200).setColumnWidth(2, 220).setColumnWidth(3, 520);
  conf.setFrozenRows(1);

  // Pestaña Casilleros
  let hoja = libro.getSheetByName(HOJAS.casilleros);
  if (!hoja) hoja = libro.insertSheet(HOJAS.casilleros, 0);
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]);
  // Agrega al final los casilleros que falten (por ejemplo, un bloque nuevo). No toca los existentes.
  const existentes = hoja.getLastRow() > 1
    ? hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues().map(v => String(v[0])) : [];
  const nuevas = [];
  BLOQUES.forEach(b => { for (let k = 1; k <= b.total; k++) {
    if (!existentes.includes(k + b.id)) nuevas.push([k + b.id, b.id, false, false, false, '', '', '', '', '', '']);
  } });
  if (nuevas.length) hoja.getRange(hoja.getLastRow() + 1, 1, nuevas.length, nuevas[0].length).setValues(nuevas);
  const n = totalCasilleros_();
  hoja.getRange(2, C.ocupado, n, 3).insertCheckboxes();
  hoja.getRange(2, C.codigo, n, 2).setNumberFormat('@');           // código y celular como texto
  hoja.getRange(2, C.reservado, n, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  hoja.getRange(2, C.pagadoEl, n, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  hoja.getRange(2, C.escribir, n, 1).setFormulas(
    Array.from({ length: n }, (_, i) => [formulaWhatsApp_(i + 2)]));
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold').setBackground('#241634').setFontColor('#ffffff');
  hoja.setFrozenRows(1);
  hoja.setFrozenColumns(1);
  hoja.getRange(1, 1, n + 1, 2).setFontWeight('bold');
  hoja.setColumnWidths(C.apellidos, 2, 160).setColumnWidth(C.notas, 260)
    .setColumnWidth(C.reservado, 130).setColumnWidth(C.pagadoEl, 130).setColumnWidth(C.escribir, 90);

  // Colores automáticos por estado (fila completa)
  const rango = hoja.getRange(2, 1, n, ENCABEZADOS.length);
  hoja.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$E2').setBackground('#e4e2e6').setFontColor('#8a8590').setRanges([rango]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($C2,$D2)').setBackground('#ece3f8').setRanges([rango]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($C2,NOT($D2))').setBackground('#fff1e0').setRanges([rango]).build(),
  ]);

  // Encabezados con nota de ayuda
  hoja.getRange(1, C.ocupado).setNote('Marcado = el casillero tiene dueño. Desmarcarlo LIBERA el casillero: la fila se limpia y los datos quedan en el Historial.');
  hoja.getRange(1, C.pago).setNote('Marcar cuando llegue la captura del Yape. Sin esto, una reserva de la página se libera sola pasado el plazo.');
  hoja.getRange(1, C.inhabilitado).setNote('Casilleros dañados o de uso del CCOA. No aparecen como disponibles.');
  hoja.getRange(1, C.reservado).setNote('Lo llena la página. Si alquilas a mano, déjalo vacío: así nunca vence solo.');
  hoja.getRange(1, C.pagadoEl).setNote('Se llena solo al marcar Pagó. Sirve para cuadrar con los Yapes recibidos.');
  hoja.getRange(1, C.escribir).setNote('Abre WhatsApp con el alumno (solo si la fila tiene celular). El mensaje se cambia en el código: MENSAJE_WHATSAPP.');

  // Pestaña Historial
  let hist = libro.getSheetByName(HOJAS.historial);
  if (!hist) {
    hist = libro.insertSheet(HOJAS.historial, 1);
    hist.getRange(1, 1, 1, HISTORIAL.length).setValues([HISTORIAL]);
  }
  hist.getRange(1, 1, 1, HISTORIAL.length).setFontWeight('bold').setBackground('#241634').setFontColor('#ffffff');
  hist.setFrozenRows(1);
  hist.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  hist.getRange('G:H').setNumberFormat('@');
  if (!hist.getFilter()) hist.getRange(1, 1, Math.max(hist.getLastRow(), 2), HISTORIAL.length).createFilter();

  proteger_(hoja, hist, n);

  // Disparadores: revisión de vencidas cada hora y registro de ediciones.
  // La edición se registra con un disparador instalable porque corre como el dueño
  // y así puede escribir en el Historial aunque esté protegido.
  ScriptApp.getProjectTriggers()
    .filter(t => ['vencerReservas', 'alEditar'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('vencerReservas').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('alEditar').forSpreadsheet(libro).onEdit().create();

  ui.alert('Listo', 'Hoja configurada.' +
    (nuevaConf ? ' Ahora: Implementar → Nueva implementación → Aplicación web.' : ''), ui.ButtonSet.OK);
}

/** Solo el dueño de la hoja puede editar el Historial, los títulos y las columnas Casillero, Bloque y WhatsApp. */
function proteger_(hoja, hist, n) {
  const DESCRIPCION = 'Casilleros CCOA (protegido)';
  [hoja, hist].forEach(h => [SpreadsheetApp.ProtectionType.SHEET, SpreadsheetApp.ProtectionType.RANGE]
    .forEach(tipo => h.getProtections(tipo).forEach(p => p.remove())));

  const yo = Session.getEffectiveUser();
  const soloDueno = p => {
    p.setDescription(DESCRIPCION);
    p.addEditor(yo);
    p.removeEditors(p.getEditors().filter(u => u.getEmail() !== yo.getEmail()));
    if (p.canDomainEdit()) p.setDomainEdit(false);
  };
  soloDueno(hist.protect());
  soloDueno(hoja.getRange(1, 1, 1, ENCABEZADOS.length).protect());
  soloDueno(hoja.getRange(2, C.casillero, n, 2).protect());
  soloDueno(hoja.getRange(2, C.escribir, n, 1).protect());
}

// ── Página pública ──────────────────────────────────────────

/** GET: el mapa. Solo id, bloque, número y estado. */
function doGet() {
  const candado = LockService.getScriptLock();
  candado.waitLock(15000);
  try {
    vencer_();
    const conf = leerConfig_();
    const casilleros = leerFilas_().map(f => ({
      id: f.casillero, bloque: f.bloque, numero: parseInt(f.casillero, 10), estado: estado_(f),
    }));
    return json_({ ok: true, ciclo: conf.ciclo, precio: conf.precio, horas: conf.horas, abierto: conf.abierto,
                   yape: conf.yape, casilleros });
  } finally {
    candado.releaseLock();
  }
}

/** POST: reservar. Todo se vuelve a validar aquí. */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, mensaje: 'Solicitud inválida.' }); }
  if (d.accion !== 'reservar') return json_({ ok: false, mensaje: 'Acción no permitida.' });
  if (d.web) return json_({ ok: false, mensaje: 'Solicitud inválida.' });   // campo trampa para robots

  const datos = {
    apellidos: texto_(d.apellidos), nombres: texto_(d.nombres),
    codigo: String(d.codigo || '').replace(/\s+/g, '').toUpperCase(),
    celular: String(d.celular || '').replace(/\D/g, ''),
  };
  const errores = {};
  if (!datos.apellidos) errores.apellidos = 'Escribe tus apellidos.';
  if (!datos.nombres) errores.nombres = 'Escribe tus nombres.';
  if (!/^\d{8}[A-Z]$/.test(datos.codigo)) errores.codigo = 'El código UNI tiene 8 números y una letra (ej. 20231234A).';
  if (!/^9\d{8}$/.test(datos.celular)) errores.celular = 'Celular de 9 dígitos que empiece con 9.';
  if (!d.acepta) errores.acepta = 'Debes aceptar las condiciones para reservar.';
  if (Object.keys(errores).length) return json_({ ok: false, errores });

  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  let resultado;
  try {
    vencer_();
    const conf = leerConfig_();
    if (!conf.abierto) return json_({ ok: false, mensaje: 'El periodo de alquiler está cerrado. Escríbenos por WhatsApp.' });

    const filas = leerFilas_();
    const f = filas.find(x => x.casillero === String(d.casilleroId));
    if (!f || estado_(f) !== 'libre')
      return json_({ ok: false, mensaje: 'Ese casillero acaba de ser tomado. Elige otro, por favor.' });

    if (conf.uno) {
      const previo = filas.find(x => x.ocupado && (x.codigo === datos.codigo || x.celular === datos.celular));
      if (previo) return json_({ ok: false, mensaje: `Ya tienes el casillero ${previo.casillero} este ciclo. Solo se permite uno por persona.` });
    }

    const ahora = new Date();
    // De Ocupado a Pagó el: ocupado, sin pagar, habilitado, datos, reservado ahora, notas y Pagó el vacíos
    hojaCasilleros_().getRange(f.fila, C.ocupado, 1, 10).setValues([[
      true, false, false, datos.apellidos, datos.nombres, datos.codigo, datos.celular, ahora, '', '',
    ]]);
    SpreadsheetApp.flush();
    registrar_('Reservó (página)', f.casillero, datos, 'Alumno', `Vence en ${conf.horas} h`);

    resultado = {
      casilleroId: f.casillero, ciclo: conf.ciclo, apellidos: datos.apellidos, nombres: datos.nombres,
      codigo: datos.codigo, venceReserva: new Date(ahora.getTime() + conf.horas * 3600000).toISOString(),
    };
    avisar_(conf, resultado, datos);
  } finally {
    candado.releaseLock();
  }
  return json_({ ok: true, alquiler: resultado });
}

// ── Ediciones a mano en la hoja (las registra en el Historial) ──
// Disparador instalable (lo crea "Configurar hoja"): corre como el dueño de la hoja.
function alEditar(e) {
  const hoja = e.range.getSheet();
  if (hoja.getName() !== HOJAS.casilleros || e.range.getRow() < 2) return;
  const col = e.range.getColumn();
  const por = (e.user && e.user.getEmail()) || 'Edición en la hoja';

  // Edición de varias celdas a la vez: solo se anota
  if (e.range.getNumRows() > 1 || e.range.getNumColumns() > 1) {
    if (col <= C.inhabilitado && e.range.getLastColumn() >= C.ocupado)
      registrar_('Edición múltiple', e.range.getA1Notation(), {}, por, 'Revisar a mano');
    return;
  }
  if (col < C.ocupado || col > C.inhabilitado) return;

  const fila = e.range.getRow();
  const f = filaDesdeValores_(fila, hoja.getRange(fila, 1, 1, ENCABEZADOS.length).getValues()[0]);
  const marcado = e.value === 'TRUE';

  if (col === C.ocupado) {
    if (marcado) return registrar_('Marcó ocupado', f.casillero, f, por);
    registrar_('Liberó', f.casillero, f, por, f.pago ? 'Estaba pagado' : 'Estaba por pagar');
    limpiarFila_(hoja, fila);
  } else if (col === C.pago) {
    if (marcado && !f.ocupado) hoja.getRange(fila, C.ocupado).setValue(true);
    hoja.getRange(fila, C.pagadoEl).setValue(marcado ? new Date() : '');
    registrar_(marcado ? 'Confirmó pago' : 'Quitó el pago', f.casillero, f, por);
  } else if (col === C.inhabilitado) {
    registrar_(marcado ? 'Inhabilitó' : 'Habilitó', f.casillero, f, por, f.notas);
  }
}

// ── Reservas vencidas ───────────────────────────────────────
function vencerReservas() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  try { vencer_(); } finally { candado.releaseLock(); }
}

function vencerReservasMenu() {
  vencerReservas();
  SpreadsheetApp.getUi().alert('Revisión hecha. Las reservas vencidas (si había) quedaron en el Historial.');
}

function vencer_() {
  const conf = leerConfig_();
  const limite = Date.now() - conf.horas * 3600000;
  const hoja = hojaCasilleros_();
  leerFilas_().forEach(f => {
    if (f.ocupado && !f.pago && f.reservado instanceof Date && f.reservado.getTime() < limite) {
      registrar_('Reserva vencida', f.casillero, f, 'Sistema', `No se confirmó el pago en ${conf.horas} h`);
      limpiarFila_(hoja, f.fila);
    }
  });
}

// ── Nuevo ciclo (renovación con prioridad) ──────────────────
function nuevoCiclo() {
  const ui = SpreadsheetApp.getUi();
  const conf = leerConfig_();
  const r = ui.prompt('Nuevo ciclo', `Ciclo actual: ${conf.ciclo}. ¿Nombre del nuevo ciclo? (ej. 2027-1)`, ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const nuevo = r.getResponseText().trim();
  if (!nuevo) return;

  const ok = ui.alert('Confirmar',
    `Se cerrará ${conf.ciclo}:\n\n` +
    '• Cada casillero ocupado queda en el Historial como "Fin de ciclo".\n' +
    '• Sigue apartado para su dueño (prioridad de renovación), pero con Pagó desmarcado.\n' +
    '• El periodo de alquiler se CIERRA en la página.\n\n¿Continuar?', ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  try {
    const hoja = hojaCasilleros_();
    leerFilas_().filter(f => f.ocupado).forEach(f => {
      registrar_('Fin de ciclo', f.casillero, f, 'Logística', f.pago ? 'Pagado' : 'Sin pagar');
      hoja.getRange(f.fila, C.pago).setValue(false);
      hoja.getRange(f.fila, C.reservado).clearContent();     // vacío = no vence solo
      hoja.getRange(f.fila, C.notas).setValue('Renovación pendiente');
      hoja.getRange(f.fila, C.pagadoEl).clearContent();
    });
    const conf2 = libroConfig_();
    conf2.getRange(filaAjuste_('ciclo'), 2).setNumberFormat('@').setValue(nuevo);
    conf2.getRange(filaAjuste_('abierto'), 2).setValue(false);
  } finally {
    candado.releaseLock();
  }
  ui.alert('Nuevo ciclo: ' + nuevo,
    'Marca "Pagó" a quienes renueven y desmarca "Ocupado" a quienes no.\n' +
    'Cuando termine el plazo de renovación, marca "Periodo de alquiler abierto" en Configuración.', ui.ButtonSet.OK);
}

// ── Utilidades ──────────────────────────────────────────────
function estado_(f) {
  if (f.inhabilitado) return 'inhabilitado';
  if (f.ocupado) return f.pago ? 'ocupado' : 'reservado';
  return 'libre';
}

function hojaCasilleros_() { return SpreadsheetApp.getActive().getSheetByName(HOJAS.casilleros); }
function libroConfig_() { return SpreadsheetApp.getActive().getSheetByName(HOJAS.config); }
function totalCasilleros_() { return BLOQUES.reduce((s, b) => s + b.total, 0); }

/** Libera una fila: desmarca Ocupado y Pagó y borra los datos del alumno y la fecha de pago. */
function limpiarFila_(hoja, fila) {
  hoja.getRange(fila, C.ocupado, 1, 2).setValues([[false, false]]);
  hoja.getRange(fila, C.apellidos, 1, 5).clearContent();
  hoja.getRange(fila, C.pagadoEl).clearContent();
}

/** Enlace a WhatsApp con el celular de la fila; vacío si no hay celular de 9 dígitos. */
function formulaWhatsApp_(fila) {
  const texto = '"' + MENSAJE_WHATSAPP.replace(/"/g, '""')
    .replace('%NOMBRE%', '"&G' + fila + '&"').replace('%CASILLERO%', '"&A' + fila + '&"') + '"';
  return `=IF(LEN(I${fila})=9,HYPERLINK("https://wa.me/51"&I${fila}&"?text="&ENCODEURL(${texto}),"Escribir"),"")`;
}

function leerFilas_() {
  const n = totalCasilleros_();
  return hojaCasilleros_().getRange(2, 1, n, ENCABEZADOS.length).getValues()
    .map((v, i) => filaDesdeValores_(i + 2, v))
    .filter(f => f.casillero);   // ignora filas vacías si aún no se corrió "Configurar hoja"
}

function filaDesdeValores_(fila, v) {
  return {
    fila, casillero: String(v[C.casillero - 1]), bloque: String(v[C.bloque - 1]),
    ocupado: v[C.ocupado - 1] === true, pago: v[C.pago - 1] === true, inhabilitado: v[C.inhabilitado - 1] === true,
    apellidos: v[C.apellidos - 1], nombres: v[C.nombres - 1], codigo: String(v[C.codigo - 1]),
    celular: String(v[C.celular - 1]), reservado: v[C.reservado - 1], notas: v[C.notas - 1],
  };
}

function filaAjuste_(clave) {
  return Object.keys(AJUSTES).indexOf(clave) + 2;
}

function leerConfig_() {
  const k = Object.keys(AJUSTES);
  const v = libroConfig_().getRange(2, 2, k.length, 1).getValues().map(x => x[0]);
  const val = clave => v[k.indexOf(clave)];
  // Si Sheets convirtió "2026-2" en fecha, se recupera como año-mes.
  const ciclo = val('ciclo') instanceof Date
    ? `${val('ciclo').getFullYear()}-${val('ciclo').getMonth() + 1}` : String(val('ciclo'));
  return {
    ciclo, precio: Number(val('precio')) || null,
    horas: Number(val('horas')) || 48, abierto: val('abierto') === true,
    avisar: String(val('avisar') || ''), uno: val('uno') === true,
    yape: { titular: String(val('yapeTitular') || '').trim(), numero: String(val('yapeNumero') || '').trim() },
  };
}

function registrar_(accion, casillero, d, por, detalle) {
  const hist = SpreadsheetApp.getActive().getSheetByName(HOJAS.historial);
  hist.appendRow([new Date(), leerConfig_().ciclo, casillero, accion,
    d.apellidos || '', d.nombres || '', d.codigo || '', d.celular || '', por || '', detalle || '']);
}

function avisar_(conf, a, d) {
  if (!conf.avisar) return;
  try {
    MailApp.sendEmail(conf.avisar,
      `Casillero ${a.casilleroId} reservado · ${d.apellidos}, ${d.nombres}`,
      `Nueva reserva desde la página de casilleros del CCOA.\n\n` +
      `Casillero: ${a.casilleroId}\nCiclo: ${a.ciclo}\nAlumno: ${d.apellidos}, ${d.nombres}\n` +
      `Código: ${d.codigo}\nCelular: ${d.celular}\n\n` +
      `Tiene ${conf.horas} h para pagar. Cuando llegue la captura del Yape, marca "Pagó" en la hoja.\n` +
      SpreadsheetApp.getActive().getUrl());
  } catch (err) { /* sin correo no se cancela la reserva */ }
}

function texto_(s) { return String(s || '').trim().replace(/\s+/g, ' ').slice(0, 60); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
