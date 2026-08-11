import { Router } from "express";
import { body } from "express-validator";
import { query, transaction } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/", authenticate, [body("items").isArray({ min: 1 }), body("direccionEntrega").trim().notEmpty()], validate, async (req, res, next) => {
  try {
    const order = await transaction(async (client) => {
      const ids = req.body.items.map((item) => Number(item.productoId));
      const products = await client.query("SELECT id,tipo_operacion,precio_venta,precio_alquiler_dia,deposito_garantia FROM productos WHERE id=ANY($1) AND disponible=true FOR UPDATE", [ids]);
      if (products.rowCount !== ids.length) throw Object.assign(new Error("Una o más prendas ya no están disponibles."), { status: 409 });
      let subtotal = 0, deposits = 0;
      for (const item of req.body.items) {
        const product = products.rows.find((p) => p.id === Number(item.productoId));
        const days = item.fechaInicio ? Math.max(1, Math.ceil((new Date(item.fechaFin)-new Date(item.fechaInicio))/86400000)+1) : 1;
        subtotal += item.operacion === "alquiler" ? Number(product.precio_alquiler_dia)*days : Number(product.precio_venta)*Number(item.cantidad||1);
        if (item.operacion === "alquiler") deposits += Number(product.deposito_garantia||0);
      }
      const created = await client.query("INSERT INTO pedidos (usuario_id,subtotal,total,direccion_entrega) VALUES ($1,$2,$3,$4) RETURNING *", [req.user.id,subtotal,subtotal+deposits,req.body.direccionEntrega]);
      for (const item of req.body.items) {
        const product = products.rows.find((p) => p.id === Number(item.productoId));
        const days = item.fechaInicio ? Math.max(1, Math.ceil((new Date(item.fechaFin)-new Date(item.fechaInicio))/86400000)+1) : 1;
        const lineRentalTotal = Number(product.precio_alquiler_dia) * days;
        const detail = await client.query("INSERT INTO pedido_detalle (pedido_id,producto_id,operacion,cantidad,precio_unitario) VALUES ($1,$2,$3,$4,$5) RETURNING id", [created.rows[0].id,item.productoId,item.operacion,item.cantidad||1,item.operacion === "alquiler" ? product.precio_alquiler_dia : product.precio_venta]);
        if (item.operacion === "alquiler") await client.query("INSERT INTO reservas (pedido_detalle_id,producto_id,usuario_id,fecha_inicio,fecha_fin,costo_total,deposito_garantia) VALUES ($1,$2,$3,$4,$5,$6,$7)", [detail.rows[0].id,item.productoId,req.user.id,item.fechaInicio,item.fechaFin,lineRentalTotal,product.deposito_garantia]);
      }
      return created.rows[0];
    });
    res.status(201).json(order);
  } catch (error) { next(error); }
});

router.get("/mine", authenticate, async (req, res, next) => { try { const result = await query("SELECT * FROM pedidos WHERE usuario_id=$1 ORDER BY creado_en DESC", [req.user.id]); res.json(result.rows); } catch (error) { next(error); } });

export default router;
