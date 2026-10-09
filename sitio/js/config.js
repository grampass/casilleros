// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN GENERAL
// Todo lo que Logística podría querer cambiar está aquí.
// No hace falta tocar ningún otro archivo para estos ajustes.
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  centro: 'Centro Cultural Óscar Almenara',
  siglas: 'CCOA',

  // Ciclo vigente: los alquileres duran todo el ciclo.
  ciclo: '2026-2',
  finDeCiclo: '2026-12-20', // fecha en que vencen todos los alquileres

  // WhatsApp de Logística (con código de país 51, sin + ni espacios).
  whatsapp: '51966378397',

  // Precio por ciclo en soles. null = se muestra "a confirmar".
  precio: 14,

  // Pago por Yape. qr: ruta de la imagen del QR (null = no se muestra).
  yape: { titular: 'Paolo Palacios', numero: '966 378 397', qr: null },

  // Redes del CCOA (pie de página).
  redes: {
    instagram: 'https://www.instagram.com/ccoafiqt.uni/',
    enlaces: 'https://linktr.ee/ccoafiqt.uni',
    usuario: '@ccoafiqt.uni',
    correo: 'ccoa.fiqt@uni.edu.pe',
  },

  // Condiciones que el alumno acepta al reservar. Se pueden editar libremente.
  condiciones: [
    'El alquiler dura todo el ciclo y es un casillero por persona. El candado lo pones tú.',
    'Al reservar tienes {horas} h para pagar por Yape y enviar la captura por WhatsApp; si no, la reserva se libera.',
    'Al terminar el ciclo hay un plazo de renovación. Quienes ya tienen casillero tienen prioridad; si no renuevas a tiempo, el casillero queda libre para otro alumno.',
    'Al dejar tu casillero, retira todas tus cosas.',
    'Tus datos (nombre, código y celular) solo los ve Logística y se usan únicamente para gestionar el alquiler (Ley 29733).',
  ],

  // Horas que dura una reserva sin pagar antes de liberarse sola.
  horasReserva: 48,

  // Un casillero por persona (por código UNI) en cada ciclo.
  unoPorPersona: true,

  // Disposición física de los casilleros.
  //   columnas × filas = cuántos hay a lo largo y a lo alto.
  //   orden 'filas'    → 1, 2, 3… de izquierda a derecha, fila por fila.
  //   orden 'columnas' → 1, 2, 3… de arriba abajo, columna por columna.
  // ⚠️ Provisional: confirmar en la visita (ver docs/Levantamiento.md).
  bloques: [
    { id: 'A', nombre: 'Dentro del CCOA', columnas: 5, filas: 4, orden: 'filas' },
    { id: 'B', nombre: 'Fuera del CCOA',  columnas: 5, filas: 4, orden: 'filas' },
  ],
};
