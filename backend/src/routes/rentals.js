import { Router } from "express";
import { body, query as checkQuery } from "express-validator";
import { query } from "../config/db.js";
import { authenticate, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/availability", [checkQuery("productId").isInt(), checkQuery("start").isISO8601(), checkQuery("end").isISO8601()], validate, async (req, res, next) => {
  try {
    const result = await query(`SELECT p.precio_alquiler_dia,p.deposito_garantia,NOT EXISTS (
      SELECT 1 FROM reservas r WHERE r.producto_id=p.id AND r.estado NOT IN ('cancelada','devuelta') AND daterange(r.fecha_inicio,r.fecha_fin,'[]') && daterange($2::date,$3::date,'[]')
      UNION ALL SELECT 1 FROM disponibilidad_producto d WHERE d.producto_id=p.id AND daterange(d.fecha_inicio,d.fecha_fin,'[]') && daterange($2::date,$3::date,'[]')
    ) AS disponible FROM productos p WHERE p.id=$1`, [req.query.productId,req.query.start,req.query.end]);
    if (!result.rowCount) return res.status(404).json({ message:"Prenda no encontrada." });
    const days = Math.max(1,Math.ceil((new Date(req.query.end)-new Date(req.query.start))/86400000)+1);
    const item = result.rows[0];
    res.json({ disponible:item.disponible,dias:days,costo:Number(item.precio_alquiler_dia)*days,deposito:Number(item.deposito_garantia) });
  } catch (error) { next(error); }
});

router.patch("/:id/status", authenticate, allowRoles("vendedor","administrador"), [body("estado").isIn(["pendiente","confirmada","entregada","devuelta","cancelada"])], validate, async (req, res, next) => {
  try {
    const result = await query(`UPDATE reservas r SET estado=$1,fecha_devolucion_real=CASE WHEN $1='devuelta' THEN NOW() ELSE fecha_devolucion_real END
      FROM productos p WHERE r.id=$2 AND p.id=r.producto_id AND (p.vendedor_id=$3 OR $4='administrador') RETURNING r.*`, [req.body.estado,req.params.id,req.user.id,req.user.role]);
    if (!result.rowCount) return res.status(404).json({ message:"Reserva no encontrada o sin permiso." });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

export default router;
