package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.IOException;

import com.ejemplo.model.UsuarioDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/admin/usuarios/acciones")
public class AdminAccionesUsuariosController extends HttpServlet {
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final Gson gson = new Gson();

    // APROBAR SELECCIÓN (Método PUT)
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        procesarAccion(req, res, "aprobar");
    }

    // ELIMINAR SELECCIÓN (Método DELETE)
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        procesarAccion(req, res, "eliminar");
    }

    private void procesarAccion(HttpServletRequest req, HttpServletResponse res, String accion) throws IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        
        try {
            BufferedReader reader = req.getReader();
            String[] correos = gson.fromJson(reader, String[].class);
            
            boolean exito = false;
            if ("aprobar".equals(accion)) {
                exito = usuarioDAO.aprobarUsuarios(correos);
            } else if ("eliminar".equals(accion)) {
                exito = usuarioDAO.eliminarUsuariosMasivo(correos);
            }

            JsonObject response = new JsonObject();
            if (exito) {
                response.addProperty("status", "success");
                response.addProperty("mensaje", "Acción masiva ejecutada correctamente.");
            } else {
                response.addProperty("status", "error");
                response.addProperty("mensaje", "No se modificó ningún registro.");
            }
            res.getWriter().write(response.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("status", "error");
            error.addProperty("mensaje", "Error interno en el procesamiento del lote.");
            res.getWriter().write(error.toString());
        }
    }
}