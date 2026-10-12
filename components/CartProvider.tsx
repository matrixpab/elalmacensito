'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ItemCarrito } from '@/lib/types';
import { trackAddToCart } from '@/lib/analytics';

interface CartContextValue {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  actualizarCantidad: (productoId: string, unidad: ItemCarrito['unidad'], cantidad: number) => void;
  eliminar: (productoId: string, unidad: ItemCarrito['unidad']) => void;
  vaciar: () => void;
  subtotal: number;
  cantidadTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'el-almacencito-carrito';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) setItems(JSON.parse(guardado));
    } catch {
      // localStorage no disponible; carrito arranca vacio
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignorar
    }
  }, [items, hidratado]);

  const agregar = useCallback((item: ItemCarrito) => {
    setItems((prev) => {
      const existente = prev.find(
        (i) => i.producto_id === item.producto_id && i.unidad === item.unidad
      );
      if (existente) {
        return prev.map((i) =>
          i === existente ? { ...i, cantidad: i.cantidad + item.cantidad } : i
        );
      }
      return [...prev, item];
    });
    trackAddToCart({
      item_id: item.producto_id,
      item_name: item.nombre,
      price: item.precio,
      quantity: item.cantidad,
    });
  }, []);

  const actualizarCantidad = useCallback(
    (productoId: string, unidad: ItemCarrito['unidad'], cantidad: number) => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.producto_id === productoId && i.unidad === unidad ? { ...i, cantidad } : i
          )
          .filter((i) => i.cantidad > 0)
      );
    },
    []
  );

  const eliminar = useCallback((productoId: string, unidad: ItemCarrito['unidad']) => {
    setItems((prev) => prev.filter((i) => !(i.producto_id === productoId && i.unidad === unidad)));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );

  const cantidadTotal = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items]);

  const value = useMemo(
    () => ({ items, agregar, actualizarCantidad, eliminar, vaciar, subtotal, cantidadTotal }),
    [items, agregar, actualizarCantidad, eliminar, vaciar, subtotal, cantidadTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
