-- ============================================================
-- EL ALMACENCITO — Datos semilla
-- Ejecutar despues de schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORIAS
-- ------------------------------------------------------------
insert into categorias (nombre, slug, descripcion, orden, activa) values
  ('Hierbas medicinales', 'hierbas-medicinales', 'Hierbas medicinales seleccionadas para tu bienestar: manzanilla, boldo, cedron y mas.', 1, true),
  ('Hierbas por kilo', 'hierbas-por-kilo', 'Hierbas naturales a granel por kilo, con el mejor precio por cantidad.', 2, true),
  ('Hierbas fraccionadas', 'hierbas-fraccionadas', 'Hierbas fraccionadas en 250 g y 500 g, ideales para probar o consumo hogareño.', 3, true),
  ('Especias', 'especias', 'Especias naturales para dar sabor y aroma a tus comidas.', 4, true),
  ('Yerbas saborizadas', 'yerbas-saborizadas', 'Yerba mate saborizada con hierbas naturales: peperina, boldo, cedron y burrito.', 5, true),
  ('Blends', 'blends', 'Mezclas de hierbas creadas para objetivos especificos de bienestar.', 6, true),
  ('Infusiones', 'infusiones', 'Infusiones naturales listas para preparar tu te o mate cocido favorito.', 7, true),
  ('Frutos secos', 'frutos-secos', 'Frutos secos naturales y tostados, fuente de energia y nutrientes.', 8, true),
  ('Promociones', 'promociones', 'Ofertas y combos especiales de la semana.', 9, true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- PRODUCTOS DE EJEMPLO
-- (SKU, precios y stock son de referencia — se administran desde el panel)
-- ------------------------------------------------------------
do $$
declare
  cat_medicinales uuid;
  cat_kilo uuid;
  cat_fraccionadas uuid;
  cat_especias uuid;
  cat_saborizadas uuid;
  cat_blends uuid;
  cat_infusiones uuid;
  cat_frutos uuid;
  cat_promos uuid;
begin
  select id into cat_medicinales from categorias where slug = 'hierbas-medicinales';
  select id into cat_kilo from categorias where slug = 'hierbas-por-kilo';
  select id into cat_fraccionadas from categorias where slug = 'hierbas-fraccionadas';
  select id into cat_especias from categorias where slug = 'especias';
  select id into cat_saborizadas from categorias where slug = 'yerbas-saborizadas';
  select id into cat_blends from categorias where slug = 'blends';
  select id into cat_infusiones from categorias where slug = 'infusiones';
  select id into cat_frutos from categorias where slug = 'frutos-secos';
  select id into cat_promos from categorias where slug = 'promociones';

  insert into productos (
    nombre, slug, categoria_id, descripcion_larga, beneficios,
    precio_1kg, precio_500g, precio_250g, precio_unidad,
    stock_actual, stock_minimo, sku, meta_title, meta_description, palabras_clave,
    activo, destacado
  ) values
  (
    'Manzanilla Premium', 'manzanilla', cat_medicinales,
    'Comprá manzanilla premium por kilo, medio kilo o cuarto kilo. Flores seleccionadas, ideales para infusiones digestivas y relajantes. Calidad seleccionada y envíos a todo el país.',
    array['Digestiva', 'Relajante', 'Ayuda a conciliar el sueño'],
    12000, 6500, 3500, null,
    50, 5, 'MANZ-001', 'Manzanilla Premium | El Almacencito',
    'Comprá manzanilla premium por kilo, medio kilo o cuarto kilo. Calidad seleccionada y envíos a todo el país.',
    array['hierbas medicinales','manzanilla','te digestivo','hierbas por kilo'],
    true, true
  ),
  (
    'Poleo', 'poleo', cat_medicinales,
    'Poleo natural seleccionado, tradicional hierba digestiva de la medicina popular argentina. Disponible por kilo, medio kilo y cuarto kilo.',
    array['Digestivo', 'Alivia molestias estomacales'],
    11000, 6000, 3200, null,
    40, 5, 'POLE-001', 'Poleo | Hierba Digestiva | El Almacencito',
    'Comprá poleo natural por kilo o fraccionado. Hierba digestiva tradicional. Envíos a todo el país.',
    array['hierbas medicinales','poleo','te digestivo','yuyos medicinales'],
    true, false
  ),
  (
    'Menta Piperita', 'menta', cat_medicinales,
    'Menta piperita de aroma intenso, ideal para infusiones digestivas y para saborizar el mate. Disponible por kilo, medio kilo, cuarto kilo y unidad.',
    array['Digestiva', 'Refrescante', 'Ideal para el mate'],
    10500, 5800, 3100, 800,
    60, 5, 'MENT-001', 'Menta Piperita | El Almacencito',
    'Comprá menta piperita natural por kilo, fraccionada o por unidad. Ideal para té digestivo y mate. Envíos a todo el país.',
    array['hierbas medicinales','menta','te digestivo','hierbas para mate','hierbas aromáticas'],
    true, true
  ),
  (
    'Cedrón', 'cedron', cat_medicinales,
    'Cedrón de aroma cítrico suave, clásico de las mezclas para mate y de las infusiones digestivas. Disponible por kilo, medio kilo y cuarto kilo.',
    array['Digestivo', 'Aromático', 'Ideal para mezclas para mate'],
    11500, 6200, 3300, null,
    35, 5, 'CEDR-001', 'Cedrón | Hierba para Mate | El Almacencito',
    'Comprá cedrón natural por kilo o fraccionado. Perfecto para el mate y como té digestivo. Envíos a todo el país.',
    array['cedrón','hierbas para mate','te digestivo','mezclas para mate'],
    true, false
  ),
  (
    'Boldo', 'boldo', cat_medicinales,
    'Boldo tradicional, reconocido en la medicina popular por sus propiedades digestivas y hepáticas. Disponible por kilo, medio kilo y cuarto kilo.',
    array['Digestivo', 'Tradicionalmente usado para el hígado'],
    11000, 6000, 3200, null,
    45, 5, 'BOLD-001', 'Boldo | El Almacencito',
    'Comprá boldo natural por kilo o fraccionado. Calidad seleccionada. Envíos a todo el país.',
    array['boldo','hierbas medicinales','te digestivo','yuyos por kilo'],
    true, false
  ),
  (
    'Melisa (Toronjil)', 'melisa', cat_medicinales,
    'Melisa o toronjil, hierba aromática tradicionalmente usada para infusiones relajantes y digestivas.',
    array['Relajante', 'Digestiva'],
    12500, 6800, 3600, null,
    30, 5, 'MELI-001', 'Melisa (Toronjil) | El Almacencito',
    'Comprá melisa natural por kilo o fraccionada. Ideal para infusiones relajantes. Envíos a todo el país.',
    array['melisa','te digestivo','hierbas medicinales'],
    true, false
  ),
  (
    'Hibiscus (Flor de Jamaica)', 'hibiscus', cat_infusiones,
    'Hibiscus en flor, ideal para preparar infusiones frías o calientes de sabor intenso y color rojo natural.',
    array['Antioxidante', 'Refrescante'],
    13500, 7200, 3800, null,
    25, 5, 'HIBI-001', 'Hibiscus (Flor de Jamaica) | El Almacencito',
    'Comprá hibiscus natural por kilo o fraccionado. Ideal para té frío. Envíos a todo el país.',
    array['hibiscus','infusiones naturales','te frio'],
    true, true
  ),
  (
    'Stevia Hoja', 'stevia', cat_medicinales,
    'Stevia en hoja, endulzante natural sin calorías, ideal para acompañar infusiones y mates.',
    array['Endulzante natural', 'Sin calorías'],
    16000, 8500, 4500, null,
    20, 5, 'STEV-001', 'Stevia Hoja | El Almacencito',
    'Comprá stevia en hoja, endulzante 100% natural. Envíos a todo el país.',
    array['stevia','productos naturales','alimentación saludable'],
    true, false
  ),
  (
    'Yerba Mate Saborizada con Peperina', 'yerba-peperina', cat_saborizadas,
    'Yerba mate saborizada naturalmente con peperina, para un mate fresco y aromático.',
    array['Sabor refrescante', 'Elaboración natural'],
    9500, 5200, 2800, null,
    40, 5, 'YERB-001', 'Yerba Mate Saborizada con Peperina | El Almacencito',
    'Comprá yerba mate saborizada con peperina. Sabor natural. Envíos a todo el país.',
    array['yerbas saborizadas','mezclas para mate','hierbas para mate'],
    true, true
  ),
  (
    'Blend Digestivo (Manzanilla, Poleo, Menta y Cedrón)', 'blend-digestivo', cat_blends,
    'Mezcla especial de manzanilla, poleo, menta y cedrón pensada para después de las comidas.',
    array['Digestivo', 'Mezcla lista para infusionar'],
    13000, 7000, 3700, null,
    30, 5, 'BLEN-001', 'Blend Digestivo | El Almacencito',
    'Comprá nuestro blend digestivo de manzanilla, poleo, menta y cedrón. Envíos a todo el país.',
    array['blends naturales','te digestivo','mezclas'],
    true, true
  ),
  (
    'Pimentón Dulce', 'pimenton-dulce', cat_especias,
    'Pimentón dulce de primera calidad, ideal para dar color y sabor a tus platos.',
    array['Condimento natural'],
    9000, 5000, 2700, null,
    50, 5, 'PIME-001', 'Pimentón Dulce | El Almacencito',
    'Comprá pimentón dulce natural por kilo o fraccionado. Envíos a todo el país.',
    array['especias naturales','condimentos'],
    true, false
  ),
  (
    'Nuez Pecan', 'nuez-pecan', cat_frutos,
    'Nuez pecan natural, fuente de energía y grasas saludables, ideal para el día a día.',
    array['Energía natural', 'Grasas saludables'],
    22000, 11500, 6000, 1200,
    25, 5, 'NUEZ-001', 'Nuez Pecan | El Almacencito',
    'Comprá nuez pecan natural por kilo, fraccionada o por unidad. Envíos a todo el país.',
    array['frutos secos','alimentación saludable'],
    true, false
  ),
  (
    'Combo Bienestar (Manzanilla + Boldo + Cedrón)', 'combo-bienestar', cat_promos,
    'Combo promocional con tres clásicos de nuestra tienda: manzanilla, boldo y cedrón, en presentación de 250 g cada uno.',
    array['Ahorro en combo', 'Selección de la casa'],
    null, null, 8500, null,
    15, 3, 'PROM-001', 'Combo Bienestar | Promoción | El Almacencito',
    'Combo promocional de manzanilla, boldo y cedrón en 250 g cada uno. Envíos a todo el país.',
    array['promociones','productos naturales'],
    true, true
  )
  on conflict (slug) do nothing;

  update productos set en_promocion = true where categoria_id = cat_promos;
end $$;
