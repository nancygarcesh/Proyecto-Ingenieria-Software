
CREATE DATABASE IF NOT EXISTS sep_productos;

USE sep_productos;

CREATE USER 'sep_user'@'%' IDENTIFIED BY 'sep_password';

GRANT ALL PRIVILEGES ON sep_productos.* TO 'sep_user'@'%';
FLUSH PRIVILEGES;


DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `nombre` VARCHAR(255) NOT NULL,
  `codigo` INT AUTO_INCREMENT PRIMARY KEY,
  `descripcion` TEXT,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `imagen` VARCHAR(500),
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `lotes` (
  `id_lote` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_producto` INT NOT NULL,
  `lote` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`codigo_producto`) REFERENCES `productos`(`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE VIEW v_stock_productos AS
SELECT 
    p.codigo AS codigo_producto,
    p.nombre AS nombre_producto,
    p.descripcion,
    p.precio_unitario,
    p.categoria,
    p.imagen,
    IFNULL(SUM(l.stock), 0) AS stock_total,
    p.fecha_creacion,
    p.fecha_actualizacion
FROM 
    productos p
LEFT JOIN 
    lotes l 
ON 
    p.codigo = l.codigo_producto
GROUP BY 
    p.codigo, p.nombre, p.descripcion, p.precio_unitario, p.categoria, 
    p.imagen, p.fecha_creacion, p.fecha_actualizacion;

CREATE VIEW v_stock_lotes AS
SELECT 
    l.codigo_producto,
    p.nombre AS nombre_producto,
    l.lote,
    l.fecha_vencimiento,
    l.stock AS stock_lote,
    p.precio_unitario,
    p.categoria
FROM 
    lotes l
JOIN 
    productos p 
ON 
    l.codigo_producto = p.codigo
ORDER BY 
    l.codigo_producto, l.fecha_vencimiento;


LOCK TABLES `productos` WRITE;

INSERT INTO `productos` 
(`nombre`, `descripcion`, `precio_unitario`, `categoria`, `imagen`) 
VALUES
('Macarilla de Arroz', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/revox-mascarilla-facial-3-minutos-ultra-hidratante-ritual-japones-1-67478_thumb_315x352.jpg'),
('Macarilla de Miel', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/ziaja-mascarilla-facial-de-miel-de-manuka-antiacne-para-pieles-grasas-1-47527_thumb_315x352.jpg'),
('Macarilla Acido Hialuronico', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/ziaja-mascarilla-y-exfoliante-facial-con-acido-hialuronico-1-79226_thumb_315x352.jpg'),
('Macarilla Colageno', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/jigott-mascarilla-facial-con-extracto-de-colageno-real-1-67999_thumb_315x352.jpg'),
('Macarilla Vitamina C', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/beauty-formulas-brightening-vitamin-c-mascarilla-hidratante-iluminador-1-74671_thumb_315x352.jpg'),
('Macarilla Baba de Caracol', 'Mascarillas Karite', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/jigott-mascarilla-facial-con-extracto-de-baba-de-caracol-1-68000_thumb_315x352.jpg'),
('Macarilla 4K Oro', 'Mascarillas Karite', 8.00, 'Skincare', 'https://cdn.grupoelcorteingles.es/SGFM/dctm/MEDIA03/202102/15/00113514805954____7__516x640.jpg'),
('Mascarilla Carbon', 'Mascarillas Líquida Peel off', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/revuele-gel-limpieza-3-en-1-con-carbon-activo-no-problem-1-33753_thumb_315x352.jpg'),
('Mascarilla Aloe Vera', 'Mascarillas Líquida Peel off', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/jigott-mascarilla-facial-con-extracto-de-aloe-1-68004_thumb_315x352.jpg'),
('Mascarilla Anti-Arrugas', 'Mascarillas Líquida Peel off', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/nivea-mascarilla-antiarrugas-q10-plus-1-60230_thumb_315x352.jpg'),
('Mascarilla Mora', 'Mascarillas de tela Chovemoar', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/essence-hello-good-stuff-mascarilla-facial-peel-off-iluminador-fresh-glow-1-75631_thumb_315x352.jpg'),
('Mascarilla Frambuesa', 'Mascarillas de tela Chovemoar', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/montagne-jeunesse-7th-heaven-mascarilla-facial-superfood-blueberry-1-50719_thumb_315x352.jpg'),
('Mascarilla Naranja', 'Mascarillas de tela Chovemoar', 8.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/garnier-mascarilla-de-tejido-para-ojos-anti-fatiga-1-39162_thumb_315x352.jpg'),
('Mascarilla Hidratante', 'Mascarillas Hidratantes', 5.00, 'Skincare', 'https://th.bing.com/th/id/OIP.tkGTuHTz97eJ_Hw53M1zyQHaHa?pid=ImgDet&rs=1'),
('Tónico facial de arroz', 'Skin Care', 30.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/missha-mascarilla-airy-fit-sheet-mask-arroz-1-47998_thumb_315x352.jpg'),
('Primers', 'Skin Care', 15.00, 'Skincare', 'https://i.pinimg.com/originals/e0/3a/1d/e03a1d5c4176ad8fc59c7537243dca32.jpg'),
('Serum de Caviar', 'Skin Care', 30.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/natura-siberica-serum-facial-revitalizante-royal-caviar-accion-profunda-anti-age-1-18380_thumb_315x352.jpg'),
('Serum de Colágeno', 'Skin Care', 30.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/revox-just-solucion-hidratante-aminoacidos-de-colageno-ha-1-55319_thumb_315x352.jpg'),
('Jabón de arroz', 'Skin Care', 15.00, 'Skincare', 'https://www.farma-amparo.es/1795-large_default/jabon-natural-arroz-100g-premium-sys.jpg'),
('Vinchas', 'Accesorio', 15.00, 'Skincare', 'https://th.bing.com/th/id/OIP.gGNFQsJQxFrE2A4VB3Sc3wHaHa?pid=ImgDet&rs=1'),
('Bálsamo de Aloe Vera', 'Hidratante de Labios', 7.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/idc-institute-balsamo-labial-aloe-vera-1-34682_thumb_315x352.jpg'),
('Base Fit Me Mc', 'Maquillaje', 20.00, 'Skincare', 'https://http2.mlstatic.com/base-maybelline-fit-me-efeito-matte-24h-pronta-entrega-D_NQ_NP_871911-MLB20670055961_042016-F.jpg'),
('Brochas 2 en 1', 'Herramienta de Maquillaje', 10.00, 'Skincare', 'https://m.media-amazon.com/images/I/412qevJ7ADL._AC_SX569_.jpg'),
('Parches Ojeras', 'Skin Care', 5.00, 'Skincare', 'https://media.glamour.mx/photos/61907b102d97bd4c522a87a3/master/w_320%2Cc_limit/210735.jpg'),
('Parches Labios', 'Skin Care', 5.00, 'Skincare', 'https://i.pinimg.com/originals/36/9e/21/369e21c579573aaa525836bc65b55554.jpg'),
('Pulpito Limpiador', 'Skin Care', 15.00, 'Skincare', 'https://th.bing.com/th/id/R.8c374e848ef334317562c70016f6f579?rik=Zg1Vd3MIryKX5g&riu=http%3a%2f%2fwww.ginza.com.bo%2fwp-content%2fuploads%2f2020%2f10%2fpulpito-doble.jpg&ehk=1UmDpThtgJcBuG%2bDqrfNjUAbn8ON8SYsHr2BNfb4Vrg%3d&risl=&pid=ImgRaw&r=0'),
('Jabón Cejas', 'Maquillaje', 15.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/jovo-jabon-para-cejas-styling-soap-1-77294_thumb_315x352.jpg'),
('Gel de Cejas', 'Maquillaje', 15.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/maybelline-gel-de-cejas-tattoo-brow-257-medium-brown-1-75021_thumb_315x352.jpg'),
('Limpiador de Brochas', 'Herramienta de Maquillaje', 20.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/isoclean-limpiador-de-brochas-275ml-1-78485_thumb_315x352.jpg'),
('Perfiladores', 'Herramienta de Maquillaje', 12.00, 'Skincare', 'https://www.maquillalia.com/images/productos/thumbnails/loreal-paris-perfilador-de-labios-lip-liner-couture-colour-riche-124-s-il-vous-plait-1-65597_thumb_315x352.jpg'),
('Labiales Nude', 'Maquillaje', 12.00, 'Skincare', 'https://th.bing.com/th/id/OIP.U5lT5nTbP6ukv_tSNCSN5wHaHa?pid=ImgDet&rs=1'),
('KIT 1 classic', '3 mascarillas a elección, 1 mascarilla peel off, 1 parche de ojeras, 1 parche de labios, 1 mascarilla comprimida, 1 gel de cejas y pestañas, 1 set de 3 perfiladores, 1 mascarilla 3 pasos nariz, 1 cepillo de cejas', 55.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 2 classic', '3 mascarillas a elección, 2 parches de labios, 2 parches de ojeras, 1 serum a elección, 1 set de 3 perfiladores, 1 bálsamo labial, 1 rimel de cejas y pestañas, 1 vincha skincare, 1 mascarilla en gel, 1 mascarilla comprimida, 1 cepillo de cejas', 100.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 3 classic', '2 mascarillas a elección, 1 mascarilla peel off, 2 parches de ojeras, 1 parche de labios, 1 mascarilla comprimida, 1 mascarilla 3 pasos nariz, 2 mascarillas en gel, 2 exfoliantes faciales, 1 gel de cejas y pestañas, 1 brocha 2 en 1, 1 cepillo de cejas', 75.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 4 classic', '2 mascarillas a elección, 1 parche de ojeras, 1 parche de labios, 1 vincha skincare, 1 jabón de arroz, 1 set de 3 perfiladores, 1 serum a elección, 1 mascarilla comprimida, 1 mascarilla 3 pasos nariz, 2 mascarillas en gel, 2 exfoliantes faciales, 1 gel de cejas y pestañas, 1 cepillo de cejas', 120.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 5 classic', '3 mascarillas a elección, 1 bálsamo labial, 1 parche de labios, 2 parches de ojeras, 2 mascarillas en gel, 1 vincha skincare, 1 mascarilla comprimida, 1 cepillo de cejas', 50.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 6 classic', '5 mascarillas a elección, 2 parches de labios, 1 parche de ojeras, 1 vincha skincare, 1 mascarilla en gel, 1 cepillo de cejas', 55.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 7 classic', '4 mascarillas a elección, 2 mascarillas exfoliantes, 2 parches de ojeras, 2 parches de labios, 4 mascarillas comprimidas, 2 mascarillas nocturnas, 1 mascarilla en gel, 1 cepillo de cejas', 75.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1'),
('KIT 8 classic', '3 mascarillas a elección, 1 parche de labios, 1 parche de ojeras, 1 serum a elección, 1 set de 3 perfiladores, 1 brocha a elección, 1 vincha skincare, 1 mascarilla en gel, 1 mascarilla comprimida, 1 cepillo de cejas', 80.00, 'Kit', 'https://th.bing.com/th/id/OIP.ycS-QNjiwXn7yeeQTd9bOwHaHa?pid=ImgDet&rs=1');


UNLOCK TABLES;

LOCK TABLES `lotes` WRITE;

INSERT INTO `lotes` 
(`codigo_producto`, `lote`, `fecha_vencimiento`, `stock`) 
VALUES
(1, 'L-20231213-001', '2025-12-31', 100),
(1, 'L-20231213-001', '2026-1-1', 50),
(1, 'L-20231213-001', '2026-2-2', 20),
(2, 'L-20231213-002', '2025-12-31', 100),
(3, 'L-20231213-003', '2025-12-31', 100),
(4, 'L-20231213-004', '2025-12-31', 100),
(5, 'L-20231213-005', '2025-12-31', 100),
(6, 'L-20231213-006', '2025-12-31', 100),
(7, 'L-20231213-007', '2025-12-31', 100),
(8, 'L-20231213-008', '2025-12-31', 100),
(9, 'L-20231213-009', '2025-12-31', 100),
(10, 'L-20231213-010', '2025-12-31', 100),
(11, 'L-20231213-011', '2025-12-31', 100),
(12, 'L-20231213-012', '2025-12-31', 100),
(13, 'L-20231213-013', '2025-12-31', 100),
(14, 'L-20231213-014', '2025-12-31', 100),
(15, 'L-20231213-015', '2025-12-31', 100),
(16, 'L-20231213-016', '2025-12-31', 100),
(17, 'L-20231213-017', '2025-12-31', 100),
(18, 'L-20231213-018', '2025-12-31', 100),
(19, 'L-20231213-019', '2025-12-31', 100),
(20, 'L-20231213-020', '2025-12-31', 100),
(21, 'L-20231213-021', '2025-12-31', 100),
(22, 'L-20231213-022', '2025-12-31', 100),
(23, 'L-20231213-023', '2025-12-31', 100),
(24, 'L-20231213-024', '2025-12-31', 100),
(25, 'L-20231213-025', '2025-12-31', 100),
(26, 'L-20231213-026', '2025-12-31', 100),
(27, 'L-20231213-027', '2025-12-31', 100),
(28, 'L-20231213-028', '2025-12-31', 100),
(29, 'L-20231213-029', '2025-12-31', 100),
(30, 'L-20231213-030', '2025-12-31', 100),
(31, 'L-20231213-031', '2025-12-31', 100),
(32, 'L-20231213-032', '2025-12-31', 20),
(33, 'L-20231213-033', '2025-12-31', 20),
(34, 'L-20231213-034', '2025-12-31', 20),
(35, 'L-20231213-035', '2025-12-31', 20),
(36, 'L-20231213-036', '2025-12-31', 20),
(37, 'L-20231213-037', '2025-12-31', 20),
(38, 'L-20231213-038', '2025-12-31', 20),
(39, 'L-20231213-039', '2025-12-31', 20);

UNLOCK TABLES;

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- Nombre de usuario único
    password VARCHAR(255) NOT NULL,       -- Contraseña cifrada
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

-- Insertar usuario inicial
-- La contraseña "123" será almacenada cifrada (usando MD5 en este ejemplo para simplicidad, pero se recomienda bcrypt o SHA-256 en producción)
INSERT INTO usuarios (username, password)
VALUES
    ('admin', MD5('123'));
