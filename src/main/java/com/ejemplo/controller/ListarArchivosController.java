package com.ejemplo.controller;

import java.io.IOException;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.ejemplo.model.Archivo;
import com.ejemplo.model.ArchivoModel;
import com.google.gson.Gson;

@WebServlet("/api/archivos/listar") // [cite: 48]
public class ListarArchivosController extends HttpServlet {
    private final ArchivoModel model = new ArchivoModel();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        List<Archivo> archivos = model.listarArchivos();
        res.getWriter().write(this.gson.toJson(archivos)); // 
    }
}
