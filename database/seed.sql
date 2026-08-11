BEGIN;
INSERT INTO roles (nombre,descripcion) VALUES ('cliente','Compra y alquila prendas'),('vendedor','Publica prendas para venta o alquiler'),('administrador','Gestiona la plataforma');
INSERT INTO ciudades (nombre,departamento) VALUES ('Santa Cruz','Santa Cruz'),('La Paz','La Paz'),('Cochabamba','Cochabamba'),('Sucre','Chuquisaca'),('Tarija','Tarija'),('Oruro','Oruro'),('Potosí','Potosí'),('Beni','Beni'),('Pando','Pando');
INSERT INTO categorias (nombre,slug) VALUES ('Vestidos','vestidos'),('Trajes','trajes'),('Camisas','camisas'),('Blusas','blusas'),('Pantalones','pantalones'),('Faldas','faldas'),('Zapatos','zapatos'),('Accesorios','accesorios'),('Ropa casual','ropa-casual'),('Ropa formal','ropa-formal'),('Abrigos','abrigos'),('Conjuntos','conjuntos');
INSERT INTO tallas (nombre,orden) VALUES ('XS',1),('S',2),('M',3),('L',4),('XL',5),('36',6),('37',7),('38',8),('39',9),('40',10),('Única',11);
INSERT INTO colores (nombre,codigo_hex) VALUES ('Negro','#171512'),('Blanco','#FFFFFF'),('Arena','#DCC6A5'),('Champán','#E5D4B3'),('Camel','#B88A5A'),('Marfil','#F6F0E4'),('Terracota','#B96545'),('Celeste','#A8C7D8'),('Oliva','#7D8050');

-- Todas las cuentas demo usan la contraseña: Demo1234
INSERT INTO usuarios (rol_id,ciudad_id,nombre,apellido,correo,telefono,password_hash,direccion,verificado) VALUES
((SELECT id FROM roles WHERE nombre='cliente'),1,'Camila','Rojas','camila@ropalia.bo','70000001','$2b$12$4MZNWtHf7fBvagOo0mcsv.f0o14PhuCuFrMBFN.pVz5Rqo64XAoXm','Equipetrol, Santa Cruz',true),
((SELECT id FROM roles WHERE nombre='vendedor'),1,'María','Flores','vendedor@ropalia.bo','70000002','$2b$12$4MZNWtHf7fBvagOo0mcsv.f0o14PhuCuFrMBFN.pVz5Rqo64XAoXm','Centro, Santa Cruz',true),
((SELECT id FROM roles WHERE nombre='administrador'),2,'Admin','Ropalia','admin@ropalia.bo','70000003','$2b$12$4MZNWtHf7fBvagOo0mcsv.f0o14PhuCuFrMBFN.pVz5Rqo64XAoXm','Sopocachi, La Paz',true);

INSERT INTO productos (vendedor_id,categoria_id,ciudad_id,talla_id,color_id,nombre,slug,descripcion,tipo_operacion,estilo,precio_alquiler_dia,deposito_garantia,material,estado_prenda,publicacion_estado,destacado) VALUES
(2,1,1,3,4,'Vestido Aura','vestido-aura','Vestido de satén con caída elegante, ideal para bodas y galas.','alquiler','formal',180,300,'Satén italiano','como_nuevo','aprobada',true),
(2,2,2,4,1,'Traje Noir','traje-noir','Traje negro de corte contemporáneo y acabado premium.','alquiler','formal',220,400,'Lana fría','excelente','aprobada',true);
INSERT INTO productos (vendedor_id,categoria_id,ciudad_id,talla_id,color_id,nombre,slug,descripcion,tipo_operacion,estilo,precio_venta,material,estado_prenda,publicacion_estado,destacado) VALUES
(2,4,3,2,6,'Blusa Lino Suave','blusa-lino-suave','Blusa ligera de fibras naturales para un estilo cotidiano refinado.','venta','casual',195,'Lino y algodón','nuevo','aprobada',true),
(2,11,4,3,5,'Abrigo Camel','abrigo-camel','Abrigo de paño estructurado, cálido y atemporal.','venta','formal',680,'Paño premium','nuevo','aprobada',true);

INSERT INTO imagenes_producto (producto_id,url,texto_alternativo,es_principal,orden) VALUES
(1,'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85','Vestido Aura',true,1),
(2,'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85','Traje Noir',true,1),
(3,'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85','Blusa Lino Suave',true,1),
(4,'https://images.unsplash.com/photo-1548624149-f6c8905e7cde?auto=format&fit=crop&w=900&q=85','Abrigo Camel',true,1);

INSERT INTO resenas (usuario_id,producto_id,puntuacion,comentario) VALUES (1,1,5,'Hermoso vestido y entrega impecable.'),(1,2,5,'El traje estaba como nuevo y quedó perfecto.');
COMMIT;
