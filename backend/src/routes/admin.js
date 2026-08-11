import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, allowRoles("administrador"));

router.get("/stats", async (_req, res, next) => {
  try {
    const result = await query(`SELECT
      (SELECT COUNT(*) FROM usuarios WHERE activo=true) usuarios,
      (SELECT COUNT(*) FROM productos) productos,
      (SELECT COUNT(*) FROM productos WHERE publicacion_estado='pendiente') pendientes,
      (SELECT COUNT(*) FROM reservas WHERE estado IN ('confirmada','entregada')) reservas_activas,
      (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE estado='aprobado') volumen_transacciones`);
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.get("/users", async (req, res, next) => {
  try { const result = await query("SELECT u.id,u.nombre,u.apellido,u.correo,u.activo,r.nombre rol,c.nombre ciudad,u.creado_en FROM usuarios u JOIN roles r ON r.id=u.rol_id LEFT JOIN ciudades c ON c.id=u.ciudad_id ORDER BY u.creado_en DESC LIMIT 100"); res.json(result.rows); } catch (error) { next(error); }
});

router.patch("/users/:id", async (req, res, next) => {
  try { const result = await query("UPDATE usuarios SET activo=$1,actualizado_en=NOW() WHERE id=$2 RETURNING id,activo", [Boolean(req.body.activo),req.params.id]); res.json(result.rows[0]); } catch (error) { next(error); }
});

export default router;
