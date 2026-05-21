package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/notas/editar")
public class EditarNotaController extends HttpServlet {

    private static final String DB_URL = "jdbc:mysql://mysql:3306/bd1";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "root";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // 1. Leer el JSON enviado por nuestro JS ({id: "1", titulo: "...", contenido: "..."})
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            // Usamos JsonParser de Gson para extraer los datos de forma 100% segura
            JsonObject jsonObject = JsonParser.parseString(sb.toString()).getAsJsonObject();
            int id = jsonObject.get("id").getAsInt();
            String titulo = jsonObject.get("titulo").getAsString();
            String contenido = jsonObject.get("contenido").getAsString();

            // 2. Localizar dónde está guardado físicamente ese archivo consultando MySQL
            String rutaServidor = null;
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                String sqlSelect = "SELECT ruta_servidor FROM archivos WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sqlSelect)) {
                    ps.setInt(1, id);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            rutaServidor = rs.getString("ruta_servidor");
                        }
                    }
                }

                if (rutaServidor == null) {
                    out.print("{\"status\":\"error\", \"mensaje\":\"El archivo no existe en la Base de Datos.\"}");
                    return;
                }

                // 3. Abrir el archivo físico y sobrescribirlo
                File archivoFisico = new File(rutaServidor);
                // IMPORTANTE: el 'false' en FileWriter indica que machacamos el contenido anterior
                try (FileWriter fw = new FileWriter(archivoFisico, false)) { 
                    fw.write(contenido);
                }

                // 4. Actualizar el nombre en MySQL por si el usuario le cambió el título
                String sqlUpdate = "UPDATE archivos SET nombre_archivo = ? WHERE id = ?";
                try (PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate)) {
                    psUpdate.setString(1, titulo);
                    psUpdate.setInt(2, id);
                    psUpdate.executeUpdate();
                }

                out.print("{\"status\":\"success\", \"mensaje\":\"Nota actualizada correctamente.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"mensaje\":\"Error del servidor: " + e.getMessage() + "\"}");
        }
    }
}