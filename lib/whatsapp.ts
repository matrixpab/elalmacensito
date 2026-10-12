import type { ItemCarrito } from './types';

export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}

export function etiquetaUnidad(unidad: ItemCarrito['unidad']): string {
  switch (unidad) {
    case '1kg':
      return '1 kg';
    case '500g':
      return '500 g';
    case '250g':
      return '250 g';
    default:
      return 'unidad';
  }
}

export function construirMensajePedido(
  items: ItemCarrito[],
  subtotal: number,
  nombre: string,
  ciudad: string,
  notas?: string
): string {
  const lineas = items
    .map(
      (item) =>
        `• ${item.nombre} (${etiquetaUnidad(item.unidad)}) x${item.cantidad} — ${formatearPrecio(
          item.precio * item.cantidad
        )}`
    )
    .join('\n');

  const partes = [
    '🌿 *¡Hola El Almacencito! Quiero confirmar este pedido de productos naturales:*',
    '',
    '*Detalle del pedido:*',
    lineas,
    '',
    `*Total estimado:* ${formatearPrecio(subtotal)}`,
    '',
    `*Nombre:* ${nombre}`,
    `*Localidad / Ciudad:* ${ciudad}`,
  ];

  if (notas && notas.trim()) {
    partes.push(`*Aclaraciones:* ${notas.trim()}`);
  }

  partes.push('');
  partes.push('Quedo a la espera de los datos de pago y costo de envío para concretar la compra. ¡Muchas gracias!');

  return partes.join('\n');
}

export function construirLinkWhatsapp(numero: string, mensaje: string): string {
  const numeroLimpio = numero.replace(/[^0-9]/g, '');
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}
