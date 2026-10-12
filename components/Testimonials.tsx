const TESTIMONIOS = [
  {
    nombre: 'Marcela G.',
    ciudad: 'Tandil',
    texto: 'Excelente calidad de las hierbas, se nota que están bien seleccionadas. El envío llegó rapidísimo.',
  },
  {
    nombre: 'Julián R.',
    ciudad: 'CABA',
    texto: 'Compro la yerba saborizada con peperina hace meses, siempre fresca y con muy buen aroma.',
  },
  {
    nombre: 'Sofía P.',
    ciudad: 'Córdoba',
    texto: 'Me encantó poder comprar por kilo, ahorro un montón contra las hierbas envasadas del súper.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-forest-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="section-title text-center">Lo que dicen nuestros clientes</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIOS.map((t) => (
            <figure key={t.nombre} className="card p-6">
              <blockquote className="text-sm text-forest-700">&ldquo;{t.texto}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-forest-800">
                {t.nombre} <span className="font-normal text-forest-500">· {t.ciudad}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
