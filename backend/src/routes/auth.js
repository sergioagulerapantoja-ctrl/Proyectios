import { Router } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const sign = (user) => jwt.sign({ id: user.id, role: user.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", [body("nombre").trim().notEmpty(), body("apellido").trim().notEmpty(), body("correo").isEmail().normalizeEmail(), body("password").isLength({ min: 6 }), body("ciudadId").isInt()], validate, async (req, res, next) => {
  try {
    const { nombre, apellido, correo, telefono, password, ciudadId, direccion } = req.body;
    const existing = await query("SELECT 1 FROM usuarios WHERE correo = $1", [correo]);
    if (existing.rowCount) return res.status(409).json({ message: "Este correo ya está registrado." });
    const hash = await bcrypt.hash(password, 12);
    const result = await query(`INSERT INTO usuarios (rol_id, ciudad_id, nombre, apellido, correo, telefono, password_hash, direccion)
      VALUES ((SELECT id FROM roles WHERE nombre='cliente'), $1,$2,$3,$4,$5,$6,$7)
      RETURNING id, nombre, apellido, correo, (SELECT nombre FROM roles WHERE id=rol_id) AS rol`, [ciudadId, nombre, apellido, correo, telefono, hash, direccion]);
    const user = result.rows[0];
    res.status(201).json({ user, token: sign(user) });
  } catch (error) { next(error); }
});

router.post("/login", [body("correo").isEmail().normalizeEmail(), body("password").notEmpty()], validate, async (req, res, next) => {
  try {
    const result = await query(`SELECT u.id,u.nombre,u.apellido,u.correo,u.password_hash,r.nombre AS rol
      FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.correo=$1 AND u.activo=true`, [req.body.correo]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    delete user.password_hash;
    res.json({ user, token: sign(user) });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const result = await query(`SELECT u.id,u.nombre,u.apellido,u.correo,u.telefono,u.direccion,c.nombre AS ciudad,r.nombre AS rol
      FROM usuarios u JOIN roles r ON r.id=u.rol_id LEFT JOIN ciudades c ON c.id=u.ciudad_id WHERE u.id=$1`, [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

export default router;
