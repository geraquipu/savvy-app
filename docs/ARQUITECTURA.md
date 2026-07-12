# Arquitectura de Savvy

Guía de referencia del proyecto. Si vuelves después de un tiempo (o entra alguien
nuevo), empieza por aquí.

---

## Qué es

Savvy (getsavvy.fr) es una **PWA en React** (una sola web app; no hay app nativa
separada). Conecta clientes con expertos que ya vivieron su situación.

- **Frontend:** React 18 + Vite, estilos inline con el token `C` (paleta).
- **Backend:** Supabase (auth, base de datos, Storage, Realtime, Edge Functions).
- **Pagos:** Stripe Checkout (edge function `create-checkout-session` + webhook).
- **Deploy:** Vercel, automático al hacer `git push` a `main`.
- **Errores:** Sentry. **Analytics:** Vercel Analytics.

```
git push main  ──►  GitHub  ──►  Vercel construye y publica  ──►  getsavvy.fr
```

---

## Convenciones de IDs (¡la fuente #1 de bugs!)

| Nombre | Qué es | Se usa en |
|---|---|---|
| `authUser.id` | UUID de auth (= `profiles.id`) | `messages.sender_id`/`receiver_id`, `bookings.client_id` |
| `authUser.expertId` | `experts.id` (PK) | `bookings.expert_id`, **`messages.expert_id`** |
| `experts.user_id` | UUID de auth del experto | `messages.receiver_id` cuando un cliente escribe a un experto |

**Reglas de oro:**
- `messages.expert_id` **siempre** es `experts.id` (PK), nunca el auth id.
- Al escribir a un experto, `receiver_id` = `experts.user_id` (auth id), NO `experts.id`,
  o se viola el foreign key `messages_receiver_id_fkey`.
- Todo objeto que representa un experto debe propagar `user_id`.

---

## Ofertas y duración — fuente única

Antes había dos formas de crear ofertas (SignupScreen vs editor) que producían
campos distintos → cada pantalla adivinaba la duración en otro sitio → bugs.

**Ahora todo pasa por `src/constants/offers.js`:**
- `normalizeOffer(raw)` → forma canónica `{ name, desc, price, durationMin, formats }`.
  Entiende las formas viejas sin migrar datos.
- Helpers: `parseDurationMin`, `formatDuration`, `slotStepFor`, `FORMAT_META`.

Cualquier pantalla que lea una oferta **debe** usar `normalizeOffer`.

---

## Parámetros de negocio — `src/constants/config.js`

Un solo sitio para los números del modelo económico:
- `EXPERT_SHARE = 0.8` (el experto recibe 80%, Savvy 20%).
- `expertPayout(price)` / `savvyCut(price)`.
- Ventana de sesión: `JOIN_OPEN_BEFORE_MIN` (15), `JOIN_CLOSE_AFTER_MIN` (75),
  `SESSION_DONE_AFTER_MIN` (90).

Si cambias la comisión, se cambia **aquí y solo aquí**.

---

## Notificaciones (bookings)

La edge function `notify-booking` envía email (Resend) + push a la parte correcta
según el evento: nueva reserva, confirmación, cancelación, reprogramación.

Se dispara de dos formas (redundantes a propósito):
1. **Database Webhook** de Supabase sobre la tabla `bookings` (INSERT/UPDATE) —
   la forma robusta, dispara siempre.
2. Invocaciones explícitas desde el cliente (`supabase.functions.invoke(...)`) —
   respaldo por si el webhook falla.

`status` vs `statut`: la DB usa `status` (inglés: pending/confirmed/cancelled);
los objetos de UI usan `statut` (francés: en attente/confirmé/annulé) para los
badges. Al mapear desde Supabase hay que derivar `statut`.

---

## Mapa de pantallas (`src/screens/`)

| Pantalla | Rol |
|---|---|
| `OnboardingScreen` | Bienvenida (primera visita) |
| `SplashScreen` | Login (Google/Apple/email) |
| `HomeScreen` / `SearchScreen` / `MatchScreen` | Descubrir expertos |
| `PublicProfileScreen` / `ExpertScreen` | Perfil de un experto |
| `BookingScreen` | Flujo de reserva (oferta → formato → fecha → envío) |
| `SuccessScreen` | Confirmación de reserva enviada |
| `ReservationsScreen` | Reservas del **cliente** |
| `ProfileScreen` + `profile/ExpertView` | Perfil propio y modo **experto** |
| `MessagingScreen` / `MessagesListScreen` | Chat |
| `AdminScreen` | Panel admin (solo geraquipu@hotmail.com) |

Las pantallas se cargan **lazy** (bajo demanda). `lazyWithReload` en `App.jsx`
recarga la página si un usuario con la versión vieja pide un chunk que ya no existe
tras un deploy (evita la pantalla blanca).

---

## Comandos útiles

```bash
# Desarrollo local
npm install
npm run dev

# Desplegar una edge function
npx supabase functions deploy notify-booking --project-ref idjvhnhhjjpogdkzrucx

# Publicar (deploy automático)
git add -A && git commit -m "mensaje" && git push origin main
```

Ref de Supabase: `idjvhnhhjjpogdkzrucx`
