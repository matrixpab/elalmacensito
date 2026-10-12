export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'entregado';

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  activa: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: string;
  categoria?: Categoria;
  descripcion_larga: string;
  beneficios: string[];
  imagen_principal: string | null;
  imagenes_secundarias: string[];
  precio_1kg: number | null;
  precio_500g: number | null;
  precio_250g: number | null;
  precio_unidad: number | null;
  stock_actual: number;
  stock_minimo: number;
  sku: string;
  meta_title: string;
  meta_description: string;
  palabras_clave: string[];
  activo: boolean;
  destacado: boolean;
  en_promocion: boolean;
  created_at: string;
  updated_at: string;
}

export type UnidadVenta = '1kg' | '500g' | '250g' | 'unidad';

export interface ItemCarrito {
  producto_id: string;
  nombre: string;
  slug: string;
  unidad: UnidadVenta;
  precio: number;
  cantidad: number;
  imagen: string | null;
}

export interface Pedido {
  id: string;
  fecha: string;
  cliente_nombre: string;
  cliente_ciudad: string;
  cliente_telefono: string | null;
  items: ItemCarrito[];
  subtotal: number;
  estado: EstadoPedido;
  created_at: string;
}

export interface Configuracion {
  id: string;
  whatsapp_numero: string;
  ga4_id: string | null;
  google_ads_id: string | null;
  gsc_verification: string | null;
  envios_info: string;
  updated_at: string;
}

export interface HistorialPrecio {
  id: string;
  fecha: string;
  tipo: 'porcentaje_general' | 'porcentaje_categoria' | 'porcentaje_seleccion' | 'manual';
  descripcion: string;
  detalle: Record<string, unknown>;
  usuario_email: string | null;
  created_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  rol: 'admin';
  created_at: string;
}
