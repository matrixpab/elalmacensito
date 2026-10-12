const PREGUNTAS = [
  {
    pregunta: '¿Cómo hago un pedido?',
    respuesta:
      'Agregá los productos que quieras al carrito, indicá tu nombre y ciudad, y el pedido se envía automáticamente por WhatsApp para coordinar el pago y el envío.',
  },
  {
    pregunta: '¿Hacen envíos a todo el país?',
    respuesta: 'Sí, enviamos a todo el país. También podés retirar en nuestro local si estás cerca.',
  },
  {
    pregunta: '¿Puedo comprar por kilo?',
    respuesta: 'Sí, la mayoría de nuestras hierbas están disponibles por kilo, medio kilo y cuarto kilo.',
  },
  {
    pregunta: '¿Qué medios de pago aceptan?',
    respuesta: 'Coordinamos el medio de pago directamente por WhatsApp una vez confirmado el pedido.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="section-title text-center">Preguntas frecuentes</h2>
      <div className="mt-8 divide-y divide-forest-100 rounded-xl2 bg-white shadow-card ring-1 ring-forest-100">
        {PREGUNTAS.map((p) => (
          <details key={p.pregunta} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display font-semibold text-forest-800">
              {p.pregunta}
              <span className="ml-4 text-forest-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-forest-600">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
