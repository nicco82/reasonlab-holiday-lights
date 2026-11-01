# holiday-lights-web
Sitio estático bilingüe (EN/ES) para instalación temporal de luces navideñas en Kissimmee/Orlando. Proyecto independiente.

## Estado
Funciona: sitio, i18n, formulario por pasos, captura de ref/UTM, eventos `dataLayer` sin PII. **Pendiente**: nombre, teléfono, email, dominio, endpoint, webhook Make, textos legales, imágenes, precios aprobados, analítica.

## Configuración
Todo en `config.js`. Valores vacíos ocultan botones y claims. `formEndpoint` vacío oculta el formulario y muestra un aviso de solicitudes no disponibles (nunca simula éxito). El nombre vacío se oculta.

## Desplegar el sitio (GitHub Pages)
1. Repositorio: https://github.com/nicco82/reasonlab-holiday-lights
2. GitHub Pages: rama `main`, carpeta `/`. Sitio: https://nicco82.github.io/reasonlab-holiday-lights/
3. Los archivos del sitio viven en la raíz. No se necesita compilación.
4. Si se confirma un dominio propio, actualizar sitemap/robots y añadir CNAME.

## Pendientes para aceptar solicitudes
- Confirmar nombre comercial y contacto, zonas, oferta, imágenes y textos legales.
- Publicar y probar el Worker con KV y Make; después configurar `formEndpoint`.
- El formulario contiene textos de consentimiento pendientes de revisión: no activarlo antes de revisarlos.
- No habilitar `TURNSTILE_SECRET` aún: falta integrar el widget/token en el frontend.
- KV no ofrece operaciones atómicas: los límites e idempotencia actuales son de mejor esfuerzo bajo concurrencia. Reforzarlos antes de producción.

## Formulario → Make
GitHub Pages no ejecuta backend. `worker/` es un Cloudflare Worker: valida en servidor, limita 5 solicitudes/h por IP, honeypot, Turnstile pendiente de integración en el navegador, idempotencia por UUID, guarda en KV **antes** de responder ok, y luego envía a Make con 3 reintentos (si fallan: `notify=pending` y clave `pending:<id>` para reenvío).
1. `cd worker && npx wrangler kv namespace create LEADS` → pegar id en `wrangler.toml`.
2. `npx wrangler secret put MAKE_WEBHOOK_URL` (y `TURNSTILE_SECRET`, `ALLOWED_ORIGIN`). Nunca en el repo.
3. `npx wrangler deploy` → copiar la URL a `formEndpoint`.
4. En Make: Custom webhook → Google Sheet/CRM + email/SMS al dueño. No activar mensajes comerciales al cliente sin consentimiento (`consent_marketing`).
Fotos: omitidas en v1; se piden por el canal de contacto. No guardar fotos/direcciones/teléfonos en el repo.

## Referidos
`?ref=CODIGO` o campo manual; se guarda como `ref` con `referral_status: unverified`. Activar promoción: `referral.enabled: true`. Elegibilidad y recompensas se validan manualmente/backend.

## Analítica
Eventos: `call_click`, `message_click`, `form_start`, `lead_saved` (solo tras confirmación). Conectar GTM/GA con IDs reales; no se incluye ninguno.
