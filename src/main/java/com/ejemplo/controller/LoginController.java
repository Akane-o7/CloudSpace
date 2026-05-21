package com.ejemplo.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.ejemplo.model.UsuarioDAO;
import com.google.gson.Gson;

import jakarta.servlet.ServletException; // <-- ¡ESTO QUITA EL ERROR ROJO!
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/api/login")
public class LoginController extends HttpServlet {
    
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException { // <-- ¡ESTO QUITA EL ERROR ROJO!
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> respuesta = new HashMap<>();
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> datos = gson.fromJson(request.getReader(), Map.class);
            
            if (datos == null || !datos.containsKey("correo") || !datos.containsKey("password")) {
                respuesta.put("status", "error");
                respuesta.put("mensaje", "INCORRECTAS");
                response.getWriter().write(gson.toJson(respuesta));
                return;
            }
            
            String correo = datos.get("correo");
            String pass = datos.get("password");

            // 1. Validar credenciales
            boolean esValido = usuarioDAO.validarUsuario(correo, pass);

            if (esValido) {
                // Si es el administrador, entra de forma directa
                if ("admin@cloudspace.com".equals(correo)) {
                    HttpSession session = request.getSession(true);
                    session.setAttribute("correo", correo);
                    respuesta.put("status", "success");
                    respuesta.put("mensaje", "Bienvenido");
                } else {
                    // Los usuarios normales deben verificar su estado
                    String estado = usuarioDAO.obtenerEstadoUsuario(correo);
                    if ("Activo".equals(estado)) {
                        HttpSession session = request.getSession(true);
                        session.setAttribute("correo", correo);
                        respuesta.put("status", "success");
                        respuesta.put("mensaje", "Bienvenido");
                    } else {
                        respuesta.put("status", "error");
                        respuesta.put("mensaje", "PENDIENTE");
                    }
                }
            } else {
                respuesta.put("status", "error");
                respuesta.put("mensaje", "INCORRECTAS");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            respuesta.put("status", "error");
            respuesta.put("mensaje", "Error interno en el servidor");
        }

        response.getWriter().write(gson.toJson(respuesta));
    }
}