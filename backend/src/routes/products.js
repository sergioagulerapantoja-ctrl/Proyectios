import { Router } from "express";
import { body } from "express-validator";
import { query } from "../config/db.js";
import { authenticate, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q="", ciudad, categoria, operacion, estilo, talla, color, estado, disponible, precioMin=0, precioMax=999999, page=1, limit=12 } = req.query;
    const offset = (Math.max(Number(page), 1) - 1) * Math.min(Number(limit), 48);
    const params = [`%${q}%`, ciudad || null, categoria || null, operacion || null, estilo || null, talla || null, color || null, estado || null, disponible || null, precioMin, precioMax, Math.min(Number(limit), 48), offset];
    const sql = `SELECT p.*, c.nombre categoria, ci.nombre ciudad, t.nombre talla, co.nombre color,
      u.nombre || ' ' || u.apellido vendedor, COALESCE(AVG(r.puntuacion),0)::numeric(2,1) valoracion,
      (SELECT url FROM imagenes_producto WHERE producto_id=p.id AND es_principal=true LIMIT 1) imagen
      FROM productos p JOIN categorias c ON c.id=p.categoria_id JOIN ciudades ci ON ci.id=p.ciudad_id
      JOIN tallas t ON t.id=p.talla_id JOIN colores co ON co.id=p.color_id JOIN usuarios u ON u.id=p.vendedor_id
      LEFT JOIN resenas r ON r.producto_id=p.id
      WHERE p.publicacion_estado='aprobada' AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1)
      AND ($2::text IS NULL OR ci.nombre=$2) AND ($3::text IS NULL OR c.nombre=$3)
      AND ($4::text IS NULL OR p.tipo_operacion=$4) AND ($5::text IS NULL OR p.estilo=$5)
      AND ($6::text IS NULL OR t.nombre=$6) AND ($7::text IS NULL OR co.nombre=$7)
      AND ($8::text IS NULL OR p.estado_prenda=$8) AND ($9::boolean IS NULL OR p.disponible=$9)
      AND COALESCE(p.precio_venta,p.precio_alquiler_dia) BETWEEN $10 AND $11
      GROUP BY p.id,c.nombre,ci.nombre,t.nombre,co.nombre,u.nombre,u.apellido ORDER BY p.destacado DESC,p.creado_en DESC LIMIT $12 OFFSET $13`;
    const result = await query(sql, params);
    res.json({ data: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await query(`SELECT p.*,c.nombre categoria,ci.nombre ciudad,t.nombre talla,co.nombre color,u.nombre||' '||u.apellido vendedor
      FROM productos p JOIN categorias c ON c.id=p.categoria_id JOIN ciudades ci ON ci.id=p.ciudad_id JOIN tallas t ON t.id=p.talla_id
      JOIN colores co ON co.id=p.color_id JOIN usuarios u ON u.id=p.vendedor_id WHERE p.id=$1`, [req.params.id]);
    if (!product.rowCount) return res.status(404).json({ message: "Prenda no encontrada." });
    const [images, reviews] = await Promise.all([query("SELECT id,url,es_principal FROM imagenes_producto WHERE producto_id=$1 ORDER BY orden", [req.params.id]), query("SELECT r.*,u.nombre FROM resenas r JOIN usuarios u ON u.id=r.usuario_id WHERE producto_id=$1 ORDER BY r.creado_en DESC", [req.params.id])]);
    res.json({ ...product.rows[0], imagenes: images.rows, resenas: reviews.rows });
  } catch (error) { next(error); }
});

router.post("/", authenticate, allowRoles("vendedor", "administrador"), [body("nombre").trim().notEmpty(), body("categoriaId").isInt(), body("ciudadId").isInt(), body("tipoOperacion").isIn(["venta","alquiler","ambos"])], validate, async (req, res, next) => {
  try {
    const p = req.body;
    const result = await query(`INSERT INTO productos (vendedor_id,categoria_id,ciudad_id,talla_id,color_id,nombre,descripcion,tipo_operacion,estilo,precio_venta,precio_alquiler_dia,deposito_garantia,material,estado_prenda,stock)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`, [req.user.id,p.categoriaId,p.ciudadId,p.tallaId,p.colorId,p.nombre,p.descripcion,p.tipoOperacion,p.estilo,p.precioVenta,p.precioAlquilerDia,p.depositoGarantia,p.material,p.estadoPrenda,p.stock||1]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.put("/:id", authenticate, allowRoles("vendedor", "administrador"), [body("nombre").trim().notEmpty()], validate, async (req, res, next) => {
  try {
    const p = req.body;
    const result = await query(`UPDATE productos SET nombre=$1,descripcion=$2,categoria_id=$3,ciudad_id=$4,talla_id=$5,color_id=$6,
      tipo_operacion=$7,estilo=$8,precio_venta=$9,precio_alquiler_dia=$10,deposito_garantia=$11,material=$12,estado_prenda=$13,stock=$14,actualizado_en=NOW()
      WHERE id=$15 AND (vendedor_id=$16 OR $17='administrador') RETURNING *`, [p.nombre,p.descripcion,p.categoriaId,p.ciudadId,p.tallaId,p.colorId,p.tipoOperacion,p.estilo,p.precioVenta,p.precioAlquilerDia,p.depositoGarantia,p.material,p.estadoPrenda,p.stock,req.params.id,req.user.id,req.user.role]);
    if (!result.rowCount) return res.status(404).json({ message: "Prenda no encontrada o sin permiso." });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post("/:id/images", authenticate, allowRoles("vendedor", "administrador"), [body("url").isURL()], validate, async (req, res, next) => {
  try {
    const owned = await query("SELECT 1 FROM productos WHERE id=$1 AND (vendedor_id=$2 OR $3='administrador')", [req.params.id,req.user.id,req.user.role]);
    if (!owned.rowCount) return res.status(404).json({ message: "Prenda no encontrada o sin permiso." });
    const image = await query("INSERT INTO imagenes_producto (producto_id,url,texto_alternativo,es_principal,orden) VALUES ($1,$2,$3,$4,$5) RETURNING *", [req.params.id,req.body.url,req.body.textoAlternativo,Boolean(req.body.esPrincipal),req.body.orden||0]);
    res.status(201).json(image.rows[0]);
  } catch (error) { next(error); }
});

router.post("/:id/favorite", authenticate, async (req, res, next) => {
  try {
    const removed = await query("DELETE FROM favoritos WHERE usuario_id=$1 AND producto_id=$2 RETURNING producto_id", [req.user.id,req.params.id]);
    if (removed.rowCount) return res.json({ favorite:false });
    await query("INSERT INTO favoritos (usuario_id,producto_id) VALUES ($1,$2)", [req.user.id,req.params.id]);
    res.status(201).json({ favorite:true });
  } catch (error) { next(error); }
});

router.post("/:id/reviews", authenticate, [body("puntuacion").isInt({min:1,max:5}), body("comentario").optional().isLength({max:1000})], validate, async (req, res, next) => {
  try {
    const result = await query("INSERT INTO resenas (usuario_id,producto_id,puntuacion,comentario) VALUES ($1,$2,$3,$4) RETURNING *", [req.user.id,req.params.id,req.body.puntuacion,req.body.comentario]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.patch("/:id/status", authenticate, allowRoles("administrador"), [body("estado").isIn(["aprobada","bloqueada","rechazada"])], validate, async (req, res, next) => {
  try { const result = await query("UPDATE productos SET publicacion_estado=$1,actualizado_en=NOW() WHERE id=$2 RETURNING *", [req.body.estado, req.params.id]); res.json(result.rows[0]); } catch (error) { next(error); }
});

export default router;
