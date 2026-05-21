package com.ejemplo.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    // 1. Valida si el correo y la contraseña son correctos
    public boolean validarUsuario(String correo, String password) {
        String sql = "SELECT * FROM usuarios WHERE correo = ? AND password = ?";
        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next(); 
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. Consulta el estado (Activo/Pendiente) de forma aislada
    public String obtenerEstadoUsuario(String correo) {
        String sql = "SELECT estado FROM usuarios WHERE correo = ?";
        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("estado");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return "Pendiente"; 
    }

    // 3. Obtiene todos los usuarios para la tabla del Panel de Administración
    public List<Usuario> obtenerTodos() {
        List<Usuario> lista = new ArrayList<>();
        String sql = "SELECT correo, password, estado FROM usuarios"; 
        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new Usuario(rs.getString("correo"), "********", rs.getString("estado"))); 
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return lista;
    }

    // 4. Aprueba múltiples usuarios a la vez
    public boolean aprobarUsuarios(String[] correos) {
        if (correos == null || correos.length == 0) return false;
        StringBuilder sql = new StringBuilder("UPDATE usuarios SET estado = 'Activo' WHERE correo IN (");
        for (int i = 0; i < correos.length; i++) {
            sql.append("?");
            if (i < correos.length - 1) sql.append(",");
        }
        sql.append(")");

        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < correos.length; i++) {
                ps.setString(i + 1, correos[i]);
            }
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 5. Elimina múltiples usuarios a la vez
    public boolean eliminarUsuariosMasivo(String[] correos) {
        if (correos == null || correos.length == 0) return false;
        StringBuilder sql = new StringBuilder("DELETE FROM usuarios WHERE correo IN (");
        for (int i = 0; i < correos.length; i++) {
            sql.append("?");
            if (i < correos.length - 1) sql.append(",");
        }
        sql.append(")");

        try (Connection conn = ConexionBD.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < correos.length; i++) {
                ps.setString(i + 1, correos[i]);
            }
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}