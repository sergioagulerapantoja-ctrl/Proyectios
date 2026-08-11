# Ropalia

Marketplace boliviano para comprar, alquilar y publicar ropa casual y formal.

## Estructura

- `app/`: frontend responsivo en React/Vinext.
- `backend/`: API REST modular con Express, JWT y PostgreSQL.
- `database/schema.sql`: modelo relacional completo e índices.
- `database/seed.sql`: catálogos, usuarios y productos de ejemplo.
- `public/`: identidad gráfica SVG de Ropalia.

## Frontend

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## API y base de datos

1. Crea una base PostgreSQL llamada `ropalia`.
2. Ejecuta `database/schema.sql` y después `database/seed.sql`.
3. Copia `backend/.env.example` a `backend/.env` y ajusta la conexión.
4. Instala y ejecuta la API:

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000/api`. Los endpoints principales son autenticación, catálogo y pedidos; las rutas están listas para ampliar pagos, cargas de imágenes y notificaciones.

## Roles demo

La interfaz permite recorrer las vistas de cliente, vendedor y administrador desde la pantalla de acceso. Las cuentas de prueba son `camila@ropalia.bo`, `vendedor@ropalia.bo` y `admin@ropalia.bo`; todas usan la contraseña `Demo1234`.
