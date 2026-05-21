package com.ejemplo.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import com.ejemplo.model.Archivo;
import com.ejemplo.model.ArchivoModel;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/archivos/descargar")
public class DescargarArchivoController extends HttpServlet {
    private final ArchivoModel model = new ArchivoModel();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String idParam = req.getParameter("id");
        if (idParam == null) return;

        Archivo archivo = model.obtenerArchivoPorId(Integer.parseInt(idParam));
        if (archivo != null) {
            File downloadFile = new File(archivo.getRuta());
            
            if(downloadFile.exists()) {
                // Forzar la descarga en el navegador
                res.setContentType("application/octet-stream");
                res.setHeader("Content-Disposition", "attachment; filename=\"" + archivo.getNombre() + "\"");
                
                try (FileInputStream in = new FileInputStream(downloadFile);
                     OutputStream out = res.getOutputStream()) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = in.read(buffer)) != -1) {
                        out.write(buffer, 0, bytesRead);
                    }
                }
            } else {
                res.getWriter().write("Error: El archivo físico no existe en el servidor.");
            }
        }
    }
}
