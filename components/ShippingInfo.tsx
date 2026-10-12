export default function ShippingInfo({ texto }: { texto: string }) {
  return (
    <section id="envios" className="bg-terracotta-50 py-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 text-center">
        <span className="text-4xl">🚚</span>
        <h2 className="font-display text-2xl font-bold text-forest-800">Envíos a todo el país</h2>
        <p className="max-w-2xl text-forest-700">{texto}</p>
      </div>
    </section>
  );
}
