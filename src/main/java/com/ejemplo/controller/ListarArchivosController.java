package com.ejemplo.controller;

import java.io.IOException;
import java.util.List;

import com.ejemplo.model.Archivo;
import com.ejemplo.model.ArchivoModel;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet; // Añadimos la importación de la sesión
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/api/archivos/listar")
public class ListarArchivosController extends HttpServlet {
    private final ArchivoModel model = new ArchivoModel();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        // 1. Recuperamos la sesión actual (sin crear una nueva)
        HttpSession session = req.getSession(false);
        
        // 2. Comprobamos que hay sesión y que el atributo del correo existe
        // IMPORTANTE: Si en tu LoginController guardaste el correo como "usuario", cambia "correo" por "usuario" aquí abajo.
        if (session != null && session.getAttribute("correo") != null) {
            
            String correoUsuario = (String) session.getAttribute("correo");
            
            // 3. Le pasamos el correo exacto al modelo
            List<Archivo> archivos = model.listarArchivos(correoUsuario);
            res.getWriter().write(this.gson.toJson(archivos));
            
        } else {
            // Si entra alguien sin sesión, le devolvemos una lista vacía por seguridad
            res.getWriter().write("[]");
        }
    }
}