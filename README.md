# Savvy

> Parlez avec quelqu'un qui l'a déjà fait.

PWA (React + Vite) que conecta clientes con expertos que ya vivieron su
situación. En producción: **[getsavvy.fr](https://getsavvy.fr)**.

## Arranque rápido

```bash
npm install
npm run dev
```

## Documentación

- **[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)** — cómo está montado todo
  (IDs, ofertas, notificaciones, mapa de pantallas). **Empieza por aquí.**
- **[docs/BACKUP.md](docs/BACKUP.md)** — copias de seguridad y recuperación.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite |
| Backend | Supabase (auth, DB, Storage, Realtime, Edge Functions) |
| Pagos | Stripe |
| Deploy | Vercel (auto en `git push` a `main`) |
| Monitoreo | Sentry, Vercel Analytics |

## Deploy

```bash
git add -A && git commit -m "mensaje" && git push origin main
```
Vercel construye y publica solo. Ref Supabase: `idjvhnhhjjpogdkzrucx`.
