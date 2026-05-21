package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ArchivoModel {

    /**
     * Operación "C" (Create): Inserta un nuevo registro de archivo en la BD.
     */
    public boolean insertarArchivoBD(String nombreArchivo, String tipo, String rutaServidor) {
        String sql = "INSERT INTO archivos (nombre_archivo, tipo, ruta_servidor) VALUES (?, ?, ?)";
        
        try (Connection conn = ConexionBD.getConnection(); 
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, nombreArchivo);
            pstmt.setString(2, tipo);
            pstmt.setString(3, rutaServidor);
            
            int filasInsertadas = pstmt.executeUpdate();
            return filasInsertadas > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Operación "R" (Read): Recupera la lista de todos los archivos guardados.
     */
    public List<Archivo> listarArchivos() {
        List<Archivo> lista = new ArrayList<>();
        String sql = "SELECT * FROM archivos ORDER BY fecha_subida DESC";
        
        try (Connection conn = ConexionBD.getConnection(); 
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                lista.add(new Archivo(
                    rs.getInt("id"),
                    rs.getString("nombre_archivo"),
                    rs.getString("tipo"),
                    rs.getString("ruta_servidor"),
                    rs.getTimestamp("fecha_subida")
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Recupera los datos de un solo archivo (necesario para saber su ruta al descargar)
     */
    public Archivo obtenerArchivoPorId(int id) {
        String sql = "SELECT * FROM archivos WHERE id = ?";
        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Archivo(
                        rs.getInt("id"), 
                        rs.getString("nombre_archivo"),
                        rs.getString("tipo"), 
                        rs.getString("ruta_servidor"), 
                        rs.getTimestamp("fecha_subida")
                    );
                }
            }
        } catch (Exception e) { 
            e.printStackTrace(); 
        }
        return null;
    }

    /**
     * Operación "D" (Delete): Elimina un archivo de la base de datos
     */
    public boolean eliminarArchivoBD(int id) {
        String sql = "DELETE FROM archivos WHERE id = ?";
        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}