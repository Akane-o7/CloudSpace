-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS bd1;
USE bd1;

-- 2. Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    estado ENUM('Activo', 'Pendiente') DEFAULT 'Pendiente'
);

-- 3. Crear la tabla de archivos (Estructura necesaria para ArchivoModel.java)
CREATE TABLE IF NOT EXISTS archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    ruta_servidor VARCHAR(500),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insertar el usuario de prueba para poder entrar siempre
-- Insertar el usuario de prueba normal (nacerá como 'Pendiente')
INSERT IGNORE INTO usuarios (correo, password, estado) VALUES ('usuario@ejemplo.com', '1234', 'Pendiente');

-- Insertar el administrador (Nace como 'Activo' automáticamente para no quedarse bloqueado)
INSERT IGNORE INTO usuarios (correo, password, estado) VALUES ('admin@cloudspace.com', 'admin123', 'Activo');