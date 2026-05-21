package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.ejemplo.model.ConexionBD;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// 1. Escuchamos exactamente en la ruta que pusimos en app.js
@WebServlet("/api/usuarios/password")
public class CambiarPasswordController extends HttpServlet {

    // Usamos los datos exactos de tu docker-compose.yml

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        // Configuramos la respuesta como JSON
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        // 2. Comprobar quién es el usuario que está intentando cambiar la contraseña
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("correo") == null) {
            /* ATENCIÓN: Si en tu LoginController guardas la sesión con otro nombre
               que no sea "correo" (por ejemplo "usuario_logeado"), cámbialo arriba. */
            out.print("{\"status\":\"error\", \"mensaje\":\"No hay sesión activa.\"}");
            return;
        }
        String correoUsuario = (String) session.getAttribute("correo");

        // 3. Leer el JSON que nos envía app.js ({ "actual": "1234", "nueva": "12345" })
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String json = sb.toString();

        // Extraemos los valores (Hago una extracción manual simple para que no tengas que instalar librerías como Gson)
        String passActual = extraerValorJSON(json, "actual");
        String passNueva = extraerValorJSON(json, "nueva");

        if (passActual == null || passNueva == null) {
            out.print("{\"status\":\"error\", \"mensaje\":\"Faltan datos en la petición.\"}");
            return;
        }

        // 4. Lógica de Base de Datos
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = ConexionBD.getConnection()) {

                // A) Verificar que la contraseña actual es la correcta en la base de datos
                String sqlCheck = "SELECT password FROM usuarios WHERE correo = ?";
                try (PreparedStatement psCheck = conn.prepareStatement(sqlCheck)) {
                    psCheck.setString(1, correoUsuario);
                    try (ResultSet rs = psCheck.executeQuery()) {
                        if (rs.next()) {
                            String dbPass = rs.getString("password");
                            // Si la contraseña de la BD no coincide con la que ha escrito el usuario
                            if (!dbPass.equals(passActual)) {
                                out.print("{\"status\":\"error\", \"mensaje\":\"La contraseña actual es incorrecta.\"}");
                                return;
                            }
                        } else {
                            out.print("{\"status\":\"error\", \"mensaje\":\"Usuario no encontrado en la base de datos.\"}");
                            return;
                        }
                    }
                }

                // B) Si era correcta, hacemos el UPDATE a la nueva contraseña
                String sqlUpdate = "UPDATE usuarios SET password = ? WHERE correo = ?";
                try (PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate)) {
                    psUpdate.setString(1, passNueva);
                    psUpdate.setString(2, correoUsuario);
                    
                    int filasAfectadas = psUpdate.executeUpdate();

                    if (filasAfectadas > 0) {
                        out.print("{\"status\":\"success\", \"mensaje\":\"Contraseña actualizada correctamente en MySQL.\"}");
                    } else {
                        out.print("{\"status\":\"error\", \"mensaje\":\"Error al guardar la nueva contraseña.\"}");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"mensaje\":\"Error del servidor: " + e.getMessage() + "\"}");
        }
    }

    // Pequeño truco para sacar datos de un JSON básico sin usar librerías externas
    private String extraerValorJSON(String json, String clave) {
        String buscar = "\"" + clave + "\":\"";
        int inicio = json.indexOf(buscar);
        if (inicio == -1) return null;
        inicio += buscar.length();
        int fin = json.indexOf("\"", inicio);
        if (fin == -1) return null;
        return json.substring(inicio, fin);
    }
}
