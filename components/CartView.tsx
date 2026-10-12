'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import WhatsAppIcon from './WhatsAppIcon';
import { formatearPrecio, etiquetaUnidad, construirMensajePedido, construirLinkWhatsapp } from '@/lib/whatsapp';
import { trackBeginCheckout, trackPurchaseRequest } from '@/lib/analytics';

export default function CartView({ whatsappNumero }: { whatsappNumero: string }) {
  const { items, actualizarCantidad, eliminar, subtotal, vaciar } = useCart();
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [notas, setNotas] = useState('');
  const [tocoEnviar, setTocoEnviar] = useState(false);

  const numWhatsApp = whatsappNumero || '5491162037583';
  const formularioValido = nombre.trim().length > 1 && ciudad.trim().length > 1 && items.length > 0;

  function enviarPedido() {
    setTocoEnviar(true);
    if (!formularioValido) return;

    const mensaje = construirMensajePedido(
      items,
      subtotal,
      nombre.trim(),
      ciudad.trim(),
      notas.trim()
    );
    const link = construirLinkWhatsapp(numWhatsApp, mensaje);

    trackPurchaseRequest(
      items.map((i) => ({
        item_id: i.producto_id,
        item_name: i.nombre,
        price: i.precio,
        quantity: i.cantidad,
      })),
      subtotal
    );

    window.open(link, '_blank', 'noopener,noreferrer');
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-forest-50 text-4xl shadow-inner mb-4">
          🛒
        </div>
        <h1 className="font-display text-3xl font-bold text-forest-900">
          Tu carrito de compras está vacío
        </h1>
        <p className="mt-3 text-base text-forest-600 max-w-lg mx-auto">
          Armá tu pedido online eligiendo entre nuestras <strong>hierbas medicinales</strong>,{' '}
          <strong>hierbas por kilo</strong>, <strong>blends</strong> y{' '}
          <strong>productos naturales</strong> seleccionados. ¡Cuando lo tengas listo, nos llega directo por WhatsApp!
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/categoria/hierbas-medicinales" className="btn-primary">
            🌿 Explorar Hierbas Medicinales
          </Link>
          <Link href="/" className="btn-secondary">
            Ver Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Encabezado SEO & Guía de compra */}
      <div className="mb-8">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
          Pedido Online Directo
        </span>
        <h1 className="section-title text-forest-900">
          Armá tu Pedido de Productos Naturales
        </h1>
        <p className="mt-2 text-sm sm:text-base text-forest-600">
          Revisá los productos seleccionados, completá tu nombre y localidad, y al pulsar{' '}
          <strong className="text-forest-900">Enviar Pedido</strong> se abrirá tu WhatsApp con el detalle
          completo para coordinar el pago y envío a todo el país.
        </p>
      </div>

      {/* Lista de productos en el carrito */}
      <div className="divide-y divide-forest-100 rounded-2xl bg-white shadow-card ring-1 ring-forest-100 overflow-hidden">
        <div className="bg-forest-50/70 px-5 py-3 text-xs font-bold uppercase tracking-wider text-forest-800 flex justify-between">
          <span>Productos en tu pedido ({items.length})</span>
          <span>Subtotal</span>
        </div>

        {items.map((item) => (
          <div
            key={`${item.producto_id}-${item.unidad}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-cream-50/30 transition"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-forest-50 border border-forest-100">
                {item.imagen ? (
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🌿</div>
                )}
              </div>
              <div>
                <p className="font-bold text-forest-900 text-base">{item.nombre}</p>
                <p className="text-xs text-forest-600 font-medium">
                  Presentación: <span className="font-semibold text-forest-800">{etiquetaUnidad(item.unidad)}</span>
                </p>
                <p className="text-xs text-forest-500 mt-0.5">
                  Unitario: {formatearPrecio(item.precio)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-forest-50">
              {/* Selector de cantidad */}
              <div className="flex items-center rounded-full border border-forest-200 bg-forest-50/50">
                <button
                  type="button"
                  className="px-3 py-1 text-forest-700 hover:text-forest-900 font-bold transition"
                  onClick={() => actualizarCantidad(item.producto_id, item.unidad, item.cantidad - 1)}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-forest-900">{item.cantidad}</span>
                <button
                  type="button"
                  className="px-3 py-1 text-forest-700 hover:text-forest-900 font-bold transition"
                  onClick={() => actualizarCantidad(item.producto_id, item.unidad, item.cantidad + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* Subtotal del item */}
              <p className="w-24 text-right font-bold text-forest-900 text-base">
                {formatearPrecio(item.precio * item.cantidad)}
              </p>

              {/* Eliminar item */}
              <button
                type="button"
                onClick={() => eliminar(item.producto_id, item.unidad)}
                className="text-stone-400 hover:text-red-500 p-1 transition"
                aria-label="Eliminar producto"
                title="Eliminar producto"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de totales */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-forest-700">
          <span className="text-lg">🏷️</span>
          <span><strong>10% de descuento</strong> abonando por transferencia directa.</span>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-bold tracking-wider text-forest-500 block">Total a confirmar:</span>
          <span className="text-2xl font-extrabold text-forest-900">{formatearPrecio(subtotal)}</span>
        </div>
      </div>

      {/* Formulario para enviar directo a WhatsApp */}
      <div className="card mt-8 p-6 sm:p-8 border-2 border-emerald-600/30">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#25D366]">Paso 2: Tus Datos</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-forest-900">
              Confirmar y Enviar Pedido a WhatsApp
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>+54 9 11 6203-7583</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-forest-600 mb-6">
          Ingresá tu nombre y localidad para que podamos calcular el costo de envío y preparar tu pedido al instante.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-forest-700">
              Tu Nombre y Apellido *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                tocoEnviar && nombre.trim().length <= 1
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                  : 'border-forest-200 focus:border-forest-500 focus:ring-forest-200'
              }`}
              placeholder="Ej: María González"
            />
            {tocoEnviar && nombre.trim().length <= 1 && (
              <p className="mt-1 text-xs text-red-500 font-medium">Por favor ingresá tu nombre.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-forest-700">
              Ciudad / Localidad de Envío *
            </label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                tocoEnviar && ciudad.trim().length <= 1
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                  : 'border-forest-200 focus:border-forest-500 focus:ring-forest-200'
              }`}
              placeholder="Ej: Tandil / Rosario / CABA"
            />
            {tocoEnviar && ciudad.trim().length <= 1 && (
              <p className="mt-1 text-xs text-red-500 font-medium">Por favor ingresá tu ciudad o localidad.</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-forest-700">
              Aclaración o Nota Adicional (Opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-xl border border-forest-200 px-3.5 py-2.5 text-sm transition focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-200"
              placeholder="Ej: Si tienen stock agregar también 1 kg de carqueja / Horario preferido"
            />
          </div>
        </div>

        {/* Botón Principal Destacado WhatsApp */}
        <div className="mt-6 pt-4 border-t border-forest-100 space-y-3">
          <button
            type="button"
            onClick={() => {
              trackBeginCheckout(
                items.map((i) => ({
                  item_id: i.producto_id,
                  item_name: i.nombre,
                  price: i.precio,
                  quantity: i.cantidad,
                })),
                subtotal
              );
              enviarPedido();
            }}
            className="w-full flex items-center justify-center gap-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 px-6 text-base font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <WhatsAppIcon className="w-6 h-6 shrink-0" />
            <span>Enviar Pedido a WhatsApp (+54 9 11 6203-7583)</span>
          </button>

          <p className="text-center text-xs text-forest-500 leading-relaxed">
            🌿 Al hacer clic se abrirá una conversación en WhatsApp con el mensaje pre-armado y todos los productos de tu pedido para coordinar pago y entrega directamente con nuestro equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
