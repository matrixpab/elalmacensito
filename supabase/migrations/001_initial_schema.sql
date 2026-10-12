-- ===========================================
-- El Almacencito — Database Schema
-- Supabase Migration
-- ===========================================

-- ---- Extensions ----
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===========================================
-- CATEGORIAS
-- ===========================================
CREATE TABLE categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  icono TEXT,
  orden INT DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- PRODUCTOS
-- ===========================================
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  descripcion TEXT,
  descripcion_larga TEXT,
  beneficios TEXT[] DEFAULT '{}',
  imagen_principal TEXT,
  imagenes_secundarias TEXT[] DEFAULT '{}',
  precio_1kg NUMERIC(10,2),
  precio_500g NUMERIC(10,2),
  precio_250g NUMERIC(10,2),
  precio_unidad NUMERIC(10,2),
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  sku TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  palabras_clave TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- PEDIDOS
-- ===========================================
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_ciudad TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_preparacion', 'entregado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- CONFIGURACION
-- ===========================================
CREATE TABLE configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- HISTORIAL DE PRECIOS
-- ===========================================
CREATE TABLE historial_precios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL
    CHECK (tipo IN ('porcentaje_global', 'porcentaje_categoria', 'porcentaje_seleccion', 'manual')),
  descripcion TEXT,
  porcentaje NUMERIC(5,2),
  productos_afectados INT DEFAULT 0,
  detalles JSONB DEFAULT '[]',
  usuario_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- USUARIOS (profiles)
-- ===========================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_productos_nombre_trgm ON productos USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_activa ON categorias(activa);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_created ON pedidos(created_at DESC);
CREATE INDEX idx_configuracion_clave ON configuracion(clave);

-- ===========================================
-- FULL TEXT SEARCH
-- ===========================================
ALTER TABLE productos ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(palabras_clave, ' '), '')), 'A')
  ) STORED;

CREATE INDEX idx_productos_fts ON productos USING gin(fts);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

-- Categorias: Public read, admin write
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_select_public" ON categorias
  FOR SELECT USING (true);

CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

-- Productos: Public read active, admin write
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_select_public" ON productos
  FOR SELECT USING (true);

CREATE POLICY "productos_admin_all" ON productos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

-- Pedidos: Public insert, admin read/update
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_insert_public" ON pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pedidos_admin_select" ON pedidos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

CREATE POLICY "pedidos_admin_update" ON pedidos
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

-- Configuracion: Public read, admin write
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_public" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "config_admin_all" ON configuracion
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

-- Historial precios: Admin only
ALTER TABLE historial_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "historial_admin_all" ON historial_precios
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')));

-- Usuarios: Self read, super_admin all
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_self" ON usuarios
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.rol = 'super_admin'));

CREATE POLICY "usuarios_admin_all" ON usuarios
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- SEED: Default Configuration
-- ===========================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('whatsapp_numero', '5491100000000', 'Número de WhatsApp para recibir pedidos'),
  ('nombre_tienda', 'El Almacencito', 'Nombre de la tienda'),
  ('slogan', 'Productos que hacen bien', 'Slogan de la tienda'),
  ('email_contacto', 'info@elalmacencito.com.ar', 'Email de contacto'),
  ('direccion', '', 'Dirección física'),
  ('instagram', '', 'Usuario de Instagram'),
  ('facebook', '', 'Página de Facebook'),
  ('ga_id', '', 'ID de Google Analytics 4'),
  ('google_ads_id', '', 'ID de Google Ads'),
  ('envio_info', 'Realizamos envíos a todo el país. Consultá costos por WhatsApp.', 'Información de envíos'),
  ('horario_atencion', 'Lunes a Viernes de 9 a 18hs. Sábados de 9 a 13hs.', 'Horario de atención');

-- ===========================================
-- SEED: Default Categories
-- ===========================================
INSERT INTO categorias (nombre, slug, descripcion, icono, orden, meta_title, meta_description) VALUES
  ('Hierbas Medicinales', 'hierbas-medicinales', 'Las mejores hierbas medicinales naturales para tu bienestar. Calidad premium seleccionada.', '🌿', 1, 'Hierbas Medicinales Naturales | El Almacencito', 'Comprá hierbas medicinales naturales de la mejor calidad. Manzanilla, boldo, valeriana, tilo y más. Envíos a todo el país.'),
  ('Hierbas por Kilo', 'hierbas-por-kilo', 'Hierbas naturales fraccionadas por kilo. La mejor relación precio-calidad.', '⚖️', 2, 'Hierbas por Kilo | El Almacencito', 'Comprá hierbas naturales por kilo al mejor precio. Cedrón, poleo, menta, melisa y muchas más.'),
  ('Hierbas Fraccionadas', 'hierbas-fraccionadas', 'Hierbas medicinales en presentaciones fraccionadas: 250g y 500g.', '📦', 3, 'Hierbas Fraccionadas | El Almacencito', 'Hierbas medicinales fraccionadas en paquetes de 250g y 500g. Prácticas y frescas.'),
  ('Especias', 'especias', 'Especias naturales y condimentos premium para tus comidas.', '🌶️', 4, 'Especias Naturales | El Almacencito', 'Especias naturales y condimentos premium. Cúrcuma, jengibre, pimienta, orégano y más.'),
  ('Yerbas Saborizadas', 'yerbas-saborizadas', 'Yerbas saborizadas artesanales con mezclas naturales de hierbas.', '🧉', 5, 'Yerbas Saborizadas | El Almacencito', 'Yerbas saborizadas artesanales con cedrón, menta, peperina y más. Para un mate diferente.'),
  ('Blends', 'blends', 'Blends naturales y mezclas artesanales de hierbas para infusiones.', '🍃', 6, 'Blends Naturales | El Almacencito', 'Blends naturales artesanales. Mezclas digestivas, relajantes y energizantes.'),
  ('Infusiones', 'infusiones', 'Infusiones naturales y tés de hierbas para cada momento del día.', '🫖', 7, 'Infusiones Naturales | El Almacencito', 'Infusiones naturales y tés de hierbas. Hibiscus, rooibos, té verde, frutos rojos y más.'),
  ('Frutos Secos', 'frutos-secos', 'Frutos secos seleccionados de la mejor calidad. Nueces, almendras, castañas y más.', '🥜', 8, 'Frutos Secos | El Almacencito', 'Frutos secos premium seleccionados. Nueces, almendras, castañas de cajú, mix energético.'),
  ('Promociones', 'promociones', 'Las mejores promociones y ofertas en productos naturales.', '🏷️', 9, 'Promociones | El Almacencito', 'Aprovechá las mejores ofertas y promociones en hierbas medicinales, especias y productos naturales.');

-- ===========================================
-- SEED: Sample Products
-- ===========================================
INSERT INTO productos (nombre, slug, categoria_id, descripcion, descripcion_larga, beneficios, precio_1kg, precio_500g, precio_250g, stock, sku, activo, destacado, palabras_clave, meta_title, meta_description) VALUES
  (
    'Manzanilla Premium',
    'manzanilla',
    (SELECT id FROM categorias WHERE slug = 'hierbas-medicinales'),
    'Manzanilla de primera calidad, ideal para infusiones relajantes y digestivas.',
    'Nuestra manzanilla premium es cuidadosamente seleccionada para garantizar la mejor calidad en cada taza. La manzanilla (Matricaria chamomilla) es una de las hierbas medicinales más populares y versátiles, reconocida por sus propiedades calmantes, digestivas y antiinflamatorias. Perfecta para preparar infusiones reconfortantes que ayudan a relajar el cuerpo y la mente. Cada flor es recolectada en su punto óptimo de maduración para preservar todos sus principios activos y su delicado aroma.',
    ARRAY['Propiedades relajantes y calmantes', 'Ayuda a la digestión', 'Antiinflamatoria natural', 'Ideal para antes de dormir', 'Apto para toda la familia'],
    8500, 4800, 2800,
    100, 'MANZ-001', true, true,
    ARRAY['manzanilla', 'manzanilla premium', 'té de manzanilla', 'infusión relajante', 'hierba medicinal', 'digestiva'],
    'Manzanilla Premium | El Almacencito',
    'Comprá manzanilla premium por kilo, medio kilo o cuarto kilo. Calidad seleccionada y envíos a todo el país.'
  ),
  (
    'Cedrón',
    'cedron',
    (SELECT id FROM categorias WHERE slug = 'hierbas-por-kilo'),
    'Cedrón fresco y aromático, perfecto para el mate y como infusión digestiva.',
    'El cedrón (Aloysia citrodora) es una de las hierbas más queridas de Argentina, conocida por su inconfundible aroma cítrico y sus propiedades digestivas. Nuestro cedrón es cuidadosamente seleccionado para ofrecerte hojas frescas y llenas de sabor. Ideal para agregar al mate, preparar infusiones o combinar con otras hierbas. Su suave sabor a limón lo convierte en el compañero perfecto para cualquier momento del día.',
    ARRAY['Excelente digestivo natural', 'Aroma cítrico inconfundible', 'Ideal para el mate', 'Propiedades antiespasmódicas', 'Ayuda a reducir el estrés'],
    7200, 4000, 2300,
    80, 'CEDR-001', true, true,
    ARRAY['cedrón', 'cedron', 'hierba para mate', 'mezcla para mate', 'digestivo natural', 'hierba argentina'],
    'Cedrón Premium | El Almacencito',
    'Cedrón fresco y aromático por kilo. Ideal para el mate y como infusión. Calidad seleccionada.'
  ),
  (
    'Poleo',
    'poleo',
    (SELECT id FROM categorias WHERE slug = 'hierbas-por-kilo'),
    'Poleo natural de aroma intenso, ideal para el mate y como digestivo.',
    'El poleo (Lippia turbinata) es una hierba aromática muy popular en Argentina, especialmente para acompañar el mate. Su sabor mentolado y refrescante lo convierte en una de las hierbas más buscadas. Nuestro poleo es seleccionado de los mejores cultivos para garantizar frescura y un aroma intenso. Además de su delicioso sabor, el poleo tiene reconocidas propiedades digestivas y refrescantes.',
    ARRAY['Sabor mentolado refrescante', 'Digestivo natural', 'Ideal para el mate', 'Propiedades refrescantes', 'Aroma intenso y duradero'],
    6800, 3800, 2200,
    90, 'POLE-001', true, true,
    ARRAY['poleo', 'hierba para mate', 'mezcla para mate', 'digestivo', 'hierba mentolada'],
    'Poleo Natural | El Almacencito',
    'Poleo natural de aroma intenso. Ideal para el mate y como digestivo. Envíos a todo el país.'
  ),
  (
    'Menta',
    'menta',
    (SELECT id FROM categorias WHERE slug = 'hierbas-medicinales'),
    'Menta fresca y aromática, perfecta para infusiones y como hierba para el mate.',
    'La menta (Mentha piperita) es una de las hierbas más versátiles y refrescantes. Nuestras hojas de menta son seleccionadas por su intenso aroma y frescura. Ideal para preparar infusiones refrescantes, agregar al mate, o usar en la cocina. La menta es reconocida por sus propiedades digestivas, refrescantes y analgésicas naturales.',
    ARRAY['Refrescante natural', 'Excelente digestivo', 'Alivia dolores de cabeza', 'Ideal para mate e infusiones', 'Propiedades analgésicas'],
    7500, 4200, 2500,
    70, 'MENT-001', true, true,
    ARRAY['menta', 'menta piperita', 'hierba refrescante', 'té de menta', 'hierba para mate', 'digestiva'],
    'Menta Fresca | El Almacencito',
    'Menta fresca y aromática de primera calidad. Para infusiones, mate y cocina. Envíos a todo el país.'
  ),
  (
    'Boldo',
    'boldo',
    (SELECT id FROM categorias WHERE slug = 'hierbas-medicinales'),
    'Boldo natural, reconocido por sus propiedades hepáticas y digestivas.',
    'El boldo (Peumus boldus) es una hierba medicinal ampliamente utilizada por sus beneficios para el hígado y el sistema digestivo. Nuestras hojas de boldo son seleccionadas cuidadosamente para garantizar la máxima concentración de principios activos. Ideal para preparar infusiones después de comidas pesadas o como parte de una rutina de bienestar natural.',
    ARRAY['Protector hepático natural', 'Excelente digestivo', 'Propiedades depurativas', 'Ideal después de comidas pesadas', 'Uso tradicional milenario'],
    6500, 3600, 2100,
    60, 'BOLD-001', true, false,
    ARRAY['boldo', 'hierba hepática', 'hierba digestiva', 'hierba medicinal', 'protector hígado'],
    'Boldo Natural | El Almacencito',
    'Boldo natural de primera calidad. Propiedades hepáticas y digestivas. Comprá online con envío a todo el país.'
  ),
  (
    'Melisa',
    'melisa',
    (SELECT id FROM categorias WHERE slug = 'hierbas-medicinales'),
    'Melisa o toronjil, hierba relajante con delicado aroma a limón.',
    'La melisa (Melissa officinalis), también conocida como toronjil, es una hierba medicinal valorada por sus propiedades calmantes y su delicado aroma a limón. Nuestras hojas de melisa son de cultivo seleccionado, ideales para preparar infusiones relajantes que ayudan a conciliar el sueño, reducir la ansiedad y mejorar la digestión. Combina perfectamente con manzanilla y cedrón.',
    ARRAY['Propiedades relajantes', 'Ayuda a conciliar el sueño', 'Aroma a limón suave', 'Reduce la ansiedad', 'Digestiva natural'],
    7800, 4300, 2600,
    50, 'MELI-001', true, false,
    ARRAY['melisa', 'toronjil', 'hierba relajante', 'infusión para dormir', 'hierba calmante'],
    'Melisa (Toronjil) | El Almacencito',
    'Melisa natural con aroma a limón. Propiedades relajantes y calmantes. Envíos a todo el país.'
  ),
  (
    'Cúrcuma en Polvo',
    'curcuma-en-polvo',
    (SELECT id FROM categorias WHERE slug = 'especias'),
    'Cúrcuma pura en polvo, superalimento con potentes propiedades antiinflamatorias.',
    'Nuestra cúrcuma (Curcuma longa) en polvo es 100% pura y natural, sin aditivos ni conservantes. La cúrcuma es reconocida mundialmente como un superalimento gracias a su contenido de curcumina, un potente antioxidante y antiinflamatorio natural. Ideal para preparar golden milk, agregar a comidas, smoothies y más. Su color dorado intenso y su sabor terroso la hacen un ingrediente versátil en la cocina saludable.',
    ARRAY['Potente antiinflamatorio natural', 'Rico en antioxidantes', 'Superalimento reconocido', 'Ideal para golden milk', 'Versátil en la cocina'],
    9200, 5100, 3000,
    40, 'CURC-001', true, true,
    ARRAY['cúrcuma', 'curcuma', 'especias', 'antiinflamatorio', 'superalimento', 'golden milk'],
    'Cúrcuma en Polvo Premium | El Almacencito',
    'Cúrcuma pura en polvo. Superalimento antiinflamatorio natural. Comprá online al mejor precio.'
  ),
  (
    'Hibiscus (Flor de Jamaica)',
    'hibiscus',
    (SELECT id FROM categorias WHERE slug = 'infusiones'),
    'Flores de hibiscus secas para preparar infusiones refrescantes y antioxidantes.',
    'El hibiscus o flor de Jamaica es una infusión de intenso color rojo y sabor ligeramente ácido y afrutado. Nuestras flores de hibiscus son seleccionadas y secadas naturalmente para preservar todas sus propiedades. Rico en vitamina C y antioxidantes, el hibiscus es ideal para preparar infusiones frías o calientes. Su hermoso color lo convierte en un ingrediente especial para cocteles y bebidas saludables.',
    ARRAY['Rico en vitamina C', 'Alto contenido de antioxidantes', 'Refrescante frío o caliente', 'Ayuda a regular la presión arterial', 'Color rojo intenso natural'],
    11000, 6000, 3500,
    35, 'HIBI-001', true, true,
    ARRAY['hibiscus', 'flor de jamaica', 'infusión antioxidante', 'té de hibiscus', 'infusión refrescante'],
    'Hibiscus (Flor de Jamaica) | El Almacencito',
    'Flores de hibiscus secas para infusiones antioxidantes. Color y sabor intenso. Envíos a todo el país.'
  ),
  (
    'Blend Digestivo',
    'blend-digestivo',
    (SELECT id FROM categorias WHERE slug = 'blends'),
    'Mezcla artesanal de hierbas digestivas: manzanilla, menta, cedrón y boldo.',
    'Nuestro Blend Digestivo es una mezcla artesanal cuidadosamente formulada con las mejores hierbas digestivas. Combina manzanilla por sus propiedades calmantes, menta por su frescura y efecto digestivo, cedrón por su aroma y propiedades antiespasmódicas, y boldo por sus beneficios hepáticos. Ideal para después de las comidas o cuando sentís malestar estomacal. Una combinación perfecta que reúne lo mejor de la herboristería natural.',
    ARRAY['Mezcla digestiva completa', 'Alivio natural de malestares', 'Ideal después de comidas', 'Combinación equilibrada', 'Sin aditivos artificiales'],
    9800, 5500, 3200,
    45, 'BLEN-DIG-001', true, true,
    ARRAY['blend digestivo', 'mezcla digestiva', 'hierbas digestivas', 'infusión digestiva', 'blend natural', 'té digestivo'],
    'Blend Digestivo Artesanal | El Almacencito',
    'Blend digestivo artesanal con manzanilla, menta, cedrón y boldo. Alivio natural. Envíos a todo el país.'
  ),
  (
    'Yerba con Cedrón y Menta',
    'yerba-cedron-menta',
    (SELECT id FROM categorias WHERE slug = 'yerbas-saborizadas'),
    'Yerba mate saborizada con cedrón y menta. Un mate diferente y natural.',
    'Nuestra yerba saborizada con cedrón y menta combina la tradición del mate argentino con el frescor de las hierbas naturales. Elaborada con yerba mate de primera calidad y una proporción perfecta de cedrón y menta naturales, sin saborizantes artificiales. El resultado es un mate suave, aromático y refrescante, ideal para disfrutar en cualquier momento del día. Perfecta para quienes buscan un mate diferente sin perder la autenticidad.',
    ARRAY['Sabor natural sin artificiales', 'Mate suave y aromático', 'Mezcla equilibrada', 'Ideal para todo el día', 'Yerba de primera calidad'],
    5800, 3200, 1900,
    120, 'YERB-CM-001', true, true,
    ARRAY['yerba saborizada', 'yerba con cedrón', 'yerba con menta', 'mate saborizado', 'yerba aromática'],
    'Yerba Saborizada con Cedrón y Menta | El Almacencito',
    'Yerba mate saborizada naturalmente con cedrón y menta. Sin artificiales. Comprá online.'
  ),
  (
    'Mix de Frutos Secos Premium',
    'mix-frutos-secos-premium',
    (SELECT id FROM categorias WHERE slug = 'frutos-secos'),
    'Mix premium de nueces, almendras, castañas de cajú y pasas de uva.',
    'Nuestro Mix de Frutos Secos Premium es una selección cuidada de los mejores frutos secos: nueces mariposa, almendras naturales, castañas de cajú y pasas de uva rubias. Cada ingrediente es seleccionado por su calidad, frescura y sabor. Rico en grasas saludables, proteínas y fibra, es el snack perfecto para llevar a cualquier parte. Ideal para picar entre comidas, agregar a ensaladas, yogur o disfrutar como colación saludable.',
    ARRAY['Rico en grasas saludables', 'Fuente de proteínas', 'Snack energético natural', 'Sin conservantes', 'Selección premium'],
    12500, 6800, 3900,
    30, 'FRSEC-MIX-001', true, true,
    ARRAY['frutos secos', 'mix frutos secos', 'nueces', 'almendras', 'castañas de cajú', 'snack saludable'],
    'Mix Frutos Secos Premium | El Almacencito',
    'Mix premium de nueces, almendras, castañas de cajú y pasas. Snack saludable. Envíos a todo el país.'
  ),
  (
    'Stevia en Hoja',
    'stevia',
    (SELECT id FROM categorias WHERE slug = 'hierbas-medicinales'),
    'Stevia natural en hoja seca. Endulzante natural sin calorías.',
    'La stevia (Stevia rebaudiana) es un endulzante natural de origen vegetal, sin calorías y con un poder endulzante hasta 300 veces mayor que el azúcar. Nuestras hojas de stevia son secadas naturalmente para conservar todas sus propiedades. Ideal para endulzar infusiones, mate, jugos y preparaciones culinarias de forma saludable. Una alternativa natural perfecta para personas que buscan reducir el consumo de azúcar.',
    ARRAY['Endulzante natural sin calorías', '300 veces más dulce que el azúcar', 'Apto para diabéticos', 'Sin procesamiento químico', 'Versátil en la cocina'],
    15000, 8200, 4800,
    25, 'STEV-001', true, false,
    ARRAY['stevia', 'endulzante natural', 'sin calorías', 'hierba dulce', 'sustituto azúcar'],
    'Stevia en Hoja Natural | El Almacencito',
    'Stevia natural en hoja seca. Endulzante sin calorías. Comprá online con envío a todo el país.'
  );
