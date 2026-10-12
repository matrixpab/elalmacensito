import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 to-cream-50">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 px-6 py-14 sm:py-20 lg:flex-row">
        <div className="flex-1 text-center lg:text-left">
          <span className="badge mb-4">Productos que hacen bien</span>
          <h1 className="font-display text-4xl font-bold leading-tight text-forest-900 sm:text-5xl">
            Hierbas Medicinales, Yuyos y Productos Naturales
          </h1>
          <p className="mt-4 text-lg text-forest-700">
            Productos naturales seleccionados para tu bienestar. Hierbas por kilo, especias,
            blends, infusiones y frutos secos con envíos a todo el país.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link href="/categoria/hierbas-medicinales" className="btn-primary">
              Ver productos
            </Link>
            <Link href="#beneficios" className="btn-secondary">
              Conocé más
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="mx-auto aspect-square w-64 rounded-full bg-white p-6 shadow-soft sm:w-80">
            <img
              src="/logo.png"
              alt="El Almacencito — Productos que hacen bien"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
