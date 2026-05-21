package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;

import com.ejemplo.model.Archivo;
import com.ejemplo.model.ArchivoModel;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/archivos/eliminar")
public class EliminarArchivosController extends HttpServlet {
    private final ArchivoModel model = new ArchivoModel();
    private final Gson gson = new Gson();

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        try {
            // Leer el JSON con los IDs
            BufferedReader reader = req.getReader();
            int[] ids = gson.fromJson(reader, int[].class);
            
            int borrados = 0;
            for (int id : ids) {
                // Opcional: Borrar el archivo físico del disco
                Archivo arch = model.obtenerArchivoPorId(id);
                if(arch != null) {
                    new File(arch.getRuta()).delete(); 
                }
                // Borrar de MySQL
                if (model.eliminarArchivoBD(id)) borrados++;
            }

            JsonObject response = new JsonObject();
            response.addProperty("status", "success");
            response.addProperty("mensaje", borrados + " archivos eliminados.");
            res.getWriter().write(response.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("status", "error");
            error.addProperty("mensaje", "Error al procesar la eliminación");
            res.getWriter().write(error.toString());
        }
    }
}