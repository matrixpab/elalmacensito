-- ============================================================
-- EL ALMACENCITO — Esquema Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase, en un proyecto nuevo.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- USUARIOS (roles de la app, separado de auth.users de Supabase)
-- ------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  rol text not null default 'admin' check (rol in ('admin')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CATEGORIAS
-- ------------------------------------------------------------
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  descripcion text,
  imagen_url text,
  orden int not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  categoria_id uuid not null references categorias(id) on delete restrict,
  descripcion_larga text not null default '',
  beneficios text[] not null default '{}',
  imagen_principal text,
  imagenes_secundarias text[] not null default '{}',
  precio_1kg numeric(10,2),
  precio_500g numeric(10,2),
  precio_250g numeric(10,2),
  precio_unidad numeric(10,2),
  stock_actual int not null default 0,
  stock_minimo int not null default 5,
  sku text unique not null,
  meta_title text not null default '',
  meta_description text not null default '',
  palabras_clave text[] not null default '{}',
  activo boolean not null default true,
  destacado boolean not null default false,
  en_promocion boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_productos_categoria on productos(categoria_id);
create index if not exists idx_productos_activo on productos(activo);
create index if not exists idx_productos_slug on productos(slug);
create index if not exists idx_productos_busqueda on productos using gin (
  to_tsvector('spanish', coalesce(nombre,'') || ' ' || coalesce(descripcion_larga,'') || ' ' || array_to_string(palabras_clave, ' '))
);

-- ------------------------------------------------------------
-- PEDIDOS
-- ------------------------------------------------------------
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  cliente_nombre text not null,
  cliente_ciudad text not null,
  cliente_telefono text,
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_preparacion','entregado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_pedidos_estado on pedidos(estado);
create index if not exists idx_pedidos_fecha on pedidos(fecha desc);

-- ------------------------------------------------------------
-- CONFIGURACION (fila unica)
-- ------------------------------------------------------------
create table if not exists configuracion (
  id int primary key default 1,
  whatsapp_numero text not null default '5490000000000',
  ga4_id text,
  google_ads_id text,
  gsc_verification text,
  envios_info text not null default 'Enviamos a todo el pais. Retiro en local disponible.',
  updated_at timestamptz not null default now(),
  constraint solo_una_fila check (id = 1)
);

insert into configuracion (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- HISTORIAL DE PRECIOS
-- ------------------------------------------------------------
create table if not exists historial_precios (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  tipo text not null check (tipo in ('porcentaje_general','porcentaje_categoria','porcentaje_seleccion','manual')),
  descripcion text not null,
  detalle jsonb not null default '{}',
  usuario_email text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Trigger updated_at productos
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_productos_updated_at on productos;
create trigger trg_productos_updated_at
before update on productos
for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table categorias enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table configuracion enable row level security;
alter table historial_precios enable row level security;
alter table usuarios enable row level security;

-- Lectura publica de catalogo activo
create policy "categorias publicas activas" on categorias
  for select using (activa = true);

create policy "productos publicos activos" on productos
  for select using (activo = true);

create policy "configuracion publica lectura" on configuracion
  for select using (true);

-- Helper: es admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from usuarios
    where auth_user_id = auth.uid() and rol = 'admin'
  );
$$ language sql stable security definer;

-- Admin: acceso total a categorias/productos (incluye inactivos)
create policy "admin categorias todo" on categorias
  for all using (is_admin()) with check (is_admin());

create policy "admin productos todo" on productos
  for all using (is_admin()) with check (is_admin());

-- Pedidos: cualquiera puede crear (checkout publico), solo admin lee/edita
create policy "cualquiera crea pedido" on pedidos
  for insert with check (true);

create policy "admin pedidos lee" on pedidos
  for select using (is_admin());

create policy "admin pedidos edita" on pedidos
  for update using (is_admin()) with check (is_admin());

-- Configuracion: solo admin actualiza
create policy "admin configuracion edita" on configuracion
  for update using (is_admin()) with check (is_admin());

-- Historial de precios: solo admin
create policy "admin historial todo" on historial_precios
  for all using (is_admin()) with check (is_admin());

-- Usuarios: un admin puede verse a si mismo y a otros admins
create policy "admin usuarios lee" on usuarios
  for select using (is_admin());

-- ============================================================
-- STORAGE: bucket publico para imagenes de productos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "lectura publica imagenes productos"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "admin sube imagenes productos"
  on storage.objects for insert
  with check (bucket_id = 'productos' and is_admin());

create policy "admin borra imagenes productos"
  on storage.objects for delete
  using (bucket_id = 'productos' and is_admin());
