package com.ejemplo.controller;

import java.io.BufferedReader;
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

@WebServlet("/api/registro")
public class RegistroController extends HttpServlet {

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
            // Leer los datos que manda el JS
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            JsonObject jsonObject = JsonParser.parseString(sb.toString()).getAsJsonObject();
            String correo = jsonObject.get("correo").getAsString();
            String password = jsonObject.get("password").getAsString();

            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                
                // 1. Comprobar si el correo ya existe
                String sqlCheck = "SELECT id FROM usuarios WHERE correo = ?";
                try (PreparedStatement psCheck = conn.prepareStatement(sqlCheck)) {
                    psCheck.setString(1, correo);
                    try (ResultSet rs = psCheck.executeQuery()) {
                        if (rs.next()) {
                            out.print("{\"status\":\"error\", \"mensaje\":\"Este correo ya está registrado.\"}");
                            return;
                        }
                    }
                }

                // 2. Insertar el nuevo usuario
                String sqlInsert = "INSERT INTO usuarios (correo, password) VALUES (?, ?)";
                try (PreparedStatement psInsert = conn.prepareStatement(sqlInsert)) {
                    psInsert.setString(1, correo);
                    psInsert.setString(2, password);
                    
                    int filas = psInsert.executeUpdate();
                    if (filas > 0) {
                        out.print("{\"status\":\"success\", \"mensaje\":\"Cuenta creada correctamente.\"}");
                    } else {
                        out.print("{\"status\":\"error\", \"mensaje\":\"No se pudo crear la cuenta.\"}");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"mensaje\":\"Error del servidor: " + e.getMessage() + "\"}");
        }
    }
}
