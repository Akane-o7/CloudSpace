package com.ejemplo.controller;

import java.io.IOException;
import java.util.List;

import com.ejemplo.model.Usuario;
import com.ejemplo.model.UsuarioDAO;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/admin/usuarios")
public class AdminUsuariosController extends HttpServlet {
    
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        // Obtenemos la lista real incluyendo el estado que modificamos en el script.sql
        List<Usuario> usuarios = usuarioDAO.obtenerTodos();

        String jsonRespuesta = this.gson.toJson(usuarios);
        res.getWriter().write(jsonRespuesta);
    }
}