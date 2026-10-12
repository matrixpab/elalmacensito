# El Almacencito — Tienda Online

Tienda online completa para "El Almacencito" (hierbas medicinales, yuyos, especias,
blends, infusiones, frutos secos y productos naturales), construida con **Next.js 15**,
**TypeScript**, **Tailwind CSS** y **Supabase**.

## 1. Requisitos

- Node.js 18.18 o superior
- Una cuenta de [Supabase](https://supabase.com) (plan gratuito alcanza para empezar)
- Un número de WhatsApp para recibir los pedidos

## 2. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. Andá a **SQL Editor** y ejecutá, en este orden:
   1. `supabase/schema.sql` — crea las tablas, políticas de seguridad (RLS) y el bucket
      de imágenes.
   2. `supabase/seed.sql` — carga las categorías y algunos productos de ejemplo (podés
      borrarlos o editarlos después desde el panel).
3. Andá a **Authentication → Users** y creá el usuario administrador (email + contraseña).
4. Copiá el `UUID` de ese usuario (columna `id` en la tabla de usuarios de Authentication).
5. En **SQL Editor**, ejecutá (reemplazando los valores):

   ```sql
   insert into usuarios (auth_user_id, email, rol)
   values ('UUID-DEL-USUARIO', 'admin@elalmacencito.com', 'admin');
   ```

6. En **Project Settings → API**, copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la expongas en el cliente!)

## 3. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de Supabase (solo servidor) |
| `NEXT_PUBLIC_SITE_URL` | URL final del sitio (para SEO, sitemap, canonical) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp por defecto (también configurable desde el panel) |
| `NEXT_PUBLIC_GA4_ID` | ID de Google Analytics 4 (también configurable desde el panel) |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | ID de Google Ads |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP` | Label de conversión de Ads para clics de WhatsApp |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_PEDIDO` | Label de conversión de Ads para pedidos enviados |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Código de verificación de Search Console (también configurable desde el panel) |

> El WhatsApp, GA4, Google Ads y la verificación de Search Console también se pueden
> cambiar en cualquier momento desde **Panel administrador → Configuración**, sin tocar
> el código ni volver a desplegar.

## 4. Instalar y correr en desarrollo

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. El panel administrador está en `http://localhost:3000/admin`.

## 5. Deploy a producción

El proyecto está listo para desplegarse en [Vercel](https://vercel.com) (recomendado) u
cualquier hosting compatible con Next.js:

1. Subí el proyecto a un repositorio Git.
2. Importalo en Vercel.
3. Cargá las mismas variables de entorno del paso 3.
4. Deploy.

## 6. Estructura del proyecto

```
app/                    Rutas (App Router)
  page.tsx              Home
  categoria/[slug]/     Página de categoría
  producto/[slug]/      Página de producto (con JSON-LD)
  carrito/               Carrito y checkout por WhatsApp
  buscar/                Buscador inteligente
  admin/                  Panel administrador (protegido)
  sitemap.ts / robots.ts  SEO técnico automático
components/             Componentes de UI
lib/                    Lógica compartida (Supabase, búsqueda, WhatsApp, analytics)
supabase/               schema.sql y seed.sql
```

## 7. Panel administrador

- **Productos**: crear, editar, eliminar, duplicar, activar/desactivar. Subida de
  imágenes directo a Supabase Storage.
- **Precios masivos**: aumento por porcentaje general, por categoría o por selección de
  productos, con vista previa antes de confirmar e historial de cambios.
- **Stock**: alertas de productos sin stock y bajo el mínimo.
- **Pedidos**: listado de pedidos recibidos por WhatsApp, con cambio de estado
  (Pendiente / En preparación / Entregado).
- **Excel**: exportar todo el catálogo a `.xlsx`, e importar un Excel para crear o
  actualizar productos en lote (matchea por SKU).
- **Configuración**: número de WhatsApp, GA4, Google Ads, Search Console e información
  de envíos.

## 8. SEO y analítica

- Sitemap (`/sitemap.xml`) y robots (`/robots.txt`) generados automáticamente a partir
  del catálogo activo.
- Meta title, meta description y slug amigable automáticos por producto (editables desde
  el panel).
- JSON-LD (`Product`, `Store`) para rich results de Google.
- Open Graph y Twitter Cards en todas las páginas.
- Eventos de Google Analytics 4: `view_item`, `add_to_cart`, `begin_checkout`,
  `whatsapp_click`, `purchase_request`.
- Conversiones de Google Ads listas para conectar (clic en WhatsApp y pedido enviado).

## 9. Buscador inteligente

El buscador entiende sinónimos y grupos temáticos (por ejemplo, "té digestivo" muestra
manzanilla, poleo, menta y cedrón). El diccionario de sinónimos está en
`lib/search-synonyms.ts` y se puede ampliar fácilmente.
