// Única fuente de datos del negocio. Vacío = no se muestra (nunca inventar).
window.SITE = {
  name: "",        // PENDIENTE
  phone: "+13217548612",          // Google Voice -> botón de llamada
  sms: "",                        // número para mensajes -> activa botón Text
  email: "",                      // PENDIENTE
  domain: "",                     // PENDIENTE
  formEndpoint: "",               // URL del Worker desplegado. Vacío = formulario deshabilitado
  turnstileSiteKey: "",           // opcional, clave pública
  price: { show: false, from: 750, feet: 100 }, // true solo con aprobación del dueño
  referral: { enabled: false, newCustomer: 25, referrer: 50, minJob: 750 },
  areas: ["Kissimmee", "St. Cloud", "Celebration", "Poinciana", "Davenport", "Southwest Orlando"], // PROVISIONAL
  showGallery: false              // true solo con fotos propias/licenciadas o renders rotulados
};
