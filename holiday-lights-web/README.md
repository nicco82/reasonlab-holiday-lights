# holiday-lights-web
Sitio estático bilingüe (EN/ES) para instalación temporal de luces navideñas en Kissimmee/Orlando. Proyecto independiente.

## Estado
Funciona: sitio, i18n, formulario por pasos, captura de ref/UTM, eventos `dataLayer` sin PII. **Pendiente**: nombre, teléfono, email, dominio, endpoint, webhook Make, textos legales, imágenes, precios aprobados, analítica.

## Configuración
Todo en `config.js`. Valores vacíos ocultan botones y claims. `formEndpoint` vacío deshabilita el envío (nunca simula éxito).

## Desplegar el sitio (GitHub Pages)
1. `git init && git add . && git commit -m "v1"`; crear repo `holiday-lights-web` en la cuenta indicada por el propietario; push.
2. Settings → Pages → rama `main`, carpeta `/`. Rutas relativas: funciona bajo `/holiday-lights-web/`.
3. Con dominio: reemplazar `DOMINIO-CONFIRMADO` en `sitemap.xml`/`robots.txt`, añadir `CNAME` propio.

## Formulario → Make
GitHub Pages no ejecuta backend. `worker/` es un Cloudflare Worker: valida en servidor, limita 5 solicitudes/h por IP, honeypot, Turnstile opcional, idempotencia por UUID, guarda en KV **antes** de responder ok, y luego envía a Make con 3 reintentos (si fallan: `notify=pending` y clave `pending:<id>` para reenvío).
1. `cd worker && npx wrangler kv namespace create LEADS` → pegar id en `wrangler.toml`.
2. `npx wrangler secret put MAKE_WEBHOOK_URL` (y `TURNSTILE_SECRET`, `ALLOWED_ORIGIN`). Nunca en el repo.
3. `npx wrangler deploy` → copiar la URL a `formEndpoint`.
4. En Make: Custom webhook → Google Sheet/CRM + email/SMS al dueño. No activar mensajes comerciales al cliente sin consentimiento (`consent_marketing`).
Fotos: omitidas en v1; se piden por el canal de contacto. No guardar fotos/direcciones/teléfonos en el repo.

## Referidos
`?ref=CODIGO` o campo manual; se guarda como `ref` con `referral_status: unverified`. Activar promoción: `referral.enabled: true`. Elegibilidad y recompensas se validan manualmente/backend.

## Analítica
Eventos: `call_click`, `message_click`, `form_start`, `lead_saved` (solo tras confirmación). Conectar GTM/GA con IDs reales; no se incluye ninguno.
