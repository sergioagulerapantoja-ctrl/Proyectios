-- Ropalia · Esquema PostgreSQL 15+
BEGIN;

CREATE TABLE roles (
  id SMALLSERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE CHECK (nombre IN ('cliente','vendedor','administrador')),
  descripcion VARCHAR(180)
);

CREATE TABLE ciudades (
  id SMALLSERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  departamento VARCHAR(80) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  rol_id SMALLINT NOT NULL REFERENCES roles(id),
  ciudad_id SMALLINT REFERENCES ciudades(id),
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  correo VARCHAR(180) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  direccion TEXT,
  avatar_url TEXT,
  verificado BOOLEAN NOT NULL DEFAULT FALSE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acceso TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id SMALLSERIAL PRIMARY KEY,
  categoria_padre_id SMALLINT REFERENCES categorias(id) ON DELETE SET NULL,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(90) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tallas (
  id SMALLSERIAL PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL UNIQUE,
  orden SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE colores (
  id SMALLSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  codigo_hex CHAR(7)
);

CREATE TABLE productos (
  id BIGSERIAL PRIMARY KEY,
  vendedor_id BIGINT NOT NULL REFERENCES usuarios(id),
  categoria_id SMALLINT NOT NULL REFERENCES categorias(id),
  ciudad_id SMALLINT NOT NULL REFERENCES ciudades(id),
  talla_id SMALLINT NOT NULL REFERENCES tallas(id),
  color_id SMALLINT NOT NULL REFERENCES colores(id),
  nombre VARCHAR(150) NOT NULL,
  slug VARCHAR(170) UNIQUE,
  descripcion TEXT NOT NULL,
  tipo_operacion VARCHAR(15) NOT NULL CHECK (tipo_operacion IN ('venta','alquiler','ambos')),
  estilo VARCHAR(15) NOT NULL CHECK (estilo IN ('casual','formal')),
  tipo_prenda VARCHAR(80),
  precio_venta NUMERIC(12,2) CHECK (precio_venta >= 0),
  precio_alquiler_dia NUMERIC(12,2) CHECK (precio_alquiler_dia >= 0),
  deposito_garantia NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (deposito_garantia >= 0),
  material VARCHAR(120),
  estado_prenda VARCHAR(25) NOT NULL CHECK (estado_prenda IN ('nuevo','como_nuevo','excelente','bueno','uso_visible')),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  publicacion_estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (publicacion_estado IN ('pendiente','aprobada','bloqueada','rechazada')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (precio_venta IS NOT NULL OR precio_alquiler_dia IS NOT NULL)
);

CREATE TABLE imagenes_producto (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  texto_alternativo VARCHAR(180),
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  orden SMALLINT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE disponibilidad_producto (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  motivo VARCHAR(100),
  CHECK (fecha_fin >= fecha_inicio),
  UNIQUE (producto_id, fecha_inicio, fecha_fin)
);

CREATE TABLE carritos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(15) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','convertido','abandonado')),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE carrito_detalle (
  id BIGSERIAL PRIMARY KEY,
  carrito_id BIGINT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  operacion VARCHAR(10) NOT NULL CHECK (operacion IN ('venta','alquiler')),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  fecha_inicio DATE,
  fecha_fin DATE,
  agregado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (carrito_id, producto_id, operacion),
  CHECK ((operacion='venta') OR (fecha_inicio IS NOT NULL AND fecha_fin >= fecha_inicio))
);

CREATE TABLE pedidos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  numero VARCHAR(30) UNIQUE GENERATED ALWAYS AS ('RP-' || LPAD(id::text, 8, '0')) STORED,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmado','preparando','enviado','entregado','cancelado')),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  descuento NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  costo_envio NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_envio >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  direccion_entrega TEXT NOT NULL,
  notas TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pedido_detalle (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  vendedor_id BIGINT REFERENCES usuarios(id),
  operacion VARCHAR(10) NOT NULL CHECK (operacion IN ('venta','alquiler')),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

CREATE TABLE reservas (
  id BIGSERIAL PRIMARY KEY,
  pedido_detalle_id BIGINT NOT NULL UNIQUE REFERENCES pedido_detalle(id),
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_devolucion_real TIMESTAMPTZ,
  dias INTEGER GENERATED ALWAYS AS (fecha_fin - fecha_inicio + 1) STORED,
  costo_total NUMERIC(12,2) NOT NULL CHECK (costo_total >= 0),
  deposito_garantia NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (deposito_garantia >= 0),
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','entregada','devuelta','cancelada')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE alquileres (
  id BIGSERIAL PRIMARY KEY,
  reserva_id BIGINT NOT NULL UNIQUE REFERENCES reservas(id),
  entregado_en TIMESTAMPTZ,
  devuelto_en TIMESTAMPTZ,
  estado_salida VARCHAR(200),
  estado_devolucion VARCHAR(200),
  cargo_extra NUMERIC(12,2) NOT NULL DEFAULT 0,
  deposito_devuelto BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE pagos (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(id),
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  referencia VARCHAR(100) UNIQUE,
  proveedor VARCHAR(50) NOT NULL,
  metodo VARCHAR(30) NOT NULL CHECK (metodo IN ('tarjeta','qr','transferencia','efectivo')),
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  moneda CHAR(3) NOT NULL DEFAULT 'BOB',
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado','reembolsado')),
  pagado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resenas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  pedido_detalle_id BIGINT REFERENCES pedido_detalle(id),
  puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  aprobada BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, pedido_detalle_id)
);

CREATE TABLE favoritos (
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, producto_id)
);

CREATE TABLE reportes (
  id BIGSERIAL PRIMARY KEY,
  reportante_id BIGINT REFERENCES usuarios(id),
  producto_id BIGINT REFERENCES productos(id),
  usuario_reportado_id BIGINT REFERENCES usuarios(id),
  motivo VARCHAR(100) NOT NULL,
  detalle TEXT,
  estado VARCHAR(15) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto','revisando','resuelto','descartado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices basados en los filtros y paneles más frecuentes.
CREATE INDEX idx_productos_catalogo ON productos (publicacion_estado, disponible, ciudad_id, categoria_id);
CREATE INDEX idx_productos_operacion_precio ON productos (tipo_operacion, precio_alquiler_dia, precio_venta);
CREATE INDEX idx_productos_vendedor ON productos (vendedor_id, creado_en DESC);
CREATE INDEX idx_pedidos_usuario_estado ON pedidos (usuario_id, estado, creado_en DESC);
CREATE INDEX idx_reservas_producto_fechas ON reservas (producto_id, fecha_inicio, fecha_fin) WHERE estado NOT IN ('cancelada','devuelta');
CREATE INDEX idx_reservas_usuario_estado ON reservas (usuario_id, estado);
CREATE INDEX idx_pagos_pedido ON pagos (pedido_id, estado);
CREATE INDEX idx_resenas_producto ON resenas (producto_id, creado_en DESC);

COMMIT;
