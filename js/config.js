/* ==========================================================
   CONFIGURACIÓN DEL NEGOCIO — Terraza 45
   ----------------------------------------------------------
   Edita aquí los datos de contacto y el horario. Los textos
   marcados en el HTML con data-config="..." se actualizan
   solos con estos valores.

   IMPORTANTE (SEO): si cambias teléfono, dirección u horario,
   actualízalos también en index.html dentro del bloque
   <script type="application/ld+json"> (datos para Google).
   ========================================================== */
window.T45_CONFIG = {
  // Teléfono tal como se muestra en la web
  telefono: '952 573 180',
  // Teléfono para enlaces "tel:" (con código de país +51, sin espacios)
  telefonoLink: '+51952573180',

  // Enlace corto de WhatsApp para los botones de "Reserva tu mesa"
  whatsappLink: 'https://wa.link/gfk7by',
  // Número de WhatsApp para mensajes prellenados (código de país 51 + número, sin "+" ni espacios)
  whatsappNumero: '51952573180',

  direccion: 'Av. Aviación 4522, Santiago de Surco 15038, Lima – Perú',

  horario: {
    // Texto largo y corto que se muestran en la web (⚠ confirmar con el cliente)
    texto: 'Jueves a domingo desde las 6:00 p.m.',
    corto: 'Jue a Dom · desde 6:00 p.m.',
    // Días abiertos: 0 = domingo, 1 = lunes, ... 4 = jueves, 5 = viernes, 6 = sábado
    dias: [4, 5, 6, 0],
    // Hora de apertura (formato 24 h)
    apertura: '18:00'
  },

  // Cómo se envía el formulario de reservas:
  //   'whatsapp'  → abre WhatsApp con el mensaje listo (por defecto, sin backend)
  //   'formspree' → envía al correo vía Formspree (ver comentario en index.html y main.js)
  reservaModo: 'whatsapp'
};
