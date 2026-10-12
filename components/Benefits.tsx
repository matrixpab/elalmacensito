const BENEFICIOS = [
  { icono: '🌿', titulo: '100% natural', texto: 'Hierbas y productos seleccionados, sin agregados.' },
  { icono: '⚖️', titulo: 'Por kilo o fraccionado', texto: 'Comprá la cantidad exacta que necesitás.' },
  { icono: '🚚', titulo: 'Envíos a todo el país', texto: 'Recibí tu pedido estés donde estés.' },
  { icono: '💬', titulo: 'Atención por WhatsApp', texto: 'Consultas y pedidos directo con nosotros.' },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="section-title text-center">¿Por qué elegirnos?</h2>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="card p-6 text-center">
            <span className="text-4xl">{b.icono}</span>
            <h3 className="mt-3 font-display text-base font-semibold text-forest-800">{b.titulo}</h3>
            <p className="mt-1 text-sm text-forest-600">{b.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
