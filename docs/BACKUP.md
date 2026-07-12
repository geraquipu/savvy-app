# Copias de seguridad de Savvy

Tienes **tres capas** de respaldo. Con cualquiera de ellas no pierdes el trabajo.

---

## 1. GitHub (backup en la nube — automático) ✅

Cada `git push` sube TODO el código a GitHub:

```
https://github.com/geraquipu/savvy-app
```

Si pierdes o se rompe el PC, recuperas todo con:

```bash
git clone https://github.com/geraquipu/savvy-app.git
cd savvy-app
npm install
```

**Esta es tu seguridad principal. Ya está activa.**

> Consejo: entra a github.com cada tanto y confirma que ves tus últimos cambios.

---

## 2. Backup local completo (ZIP) 💾

En `~/Documents/Savvy/backups/` se guardan copias comprimidas del proyecto
(sin `node_modules`, que se reinstala solo). Para crear una nueva:

```bash
bash ~/Documents/Savvy/backups/hacer-backup.sh
```

Genera un archivo tipo `savvy-2026-07-12.zip`. Guárdalo también en:
- Google Drive / iCloud / Dropbox, o
- un disco externo.

Así tienes una copia **fuera de GitHub y fuera del PC**.

---

## 3. Supabase (base de datos)

El código es una parte; la **base de datos** (usuarios, reservas, mensajes) vive
en Supabase. Supabase hace backups automáticos en su plan, pero para exportar
manualmente:

- Dashboard → Database → Backups, o
- Table Editor → exportar a CSV las tablas importantes (`experts`, `bookings`,
  `messages`, `profiles`, `availability`).

---

## Qué NO se sube (y está bien)

- `node_modules/` — se reinstala con `npm install`.
- Claves secretas (Stripe, Resend) — viven en Supabase/Vercel, no en el código.

---

## Regla simple

**Después de cada sesión de trabajo importante:** que se haya hecho `git push`
(ya lo hacemos) + de vez en cuando, un ZIP a tu Drive. Con eso estás cubierto.
