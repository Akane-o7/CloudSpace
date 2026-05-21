package com.ejemplo.controller;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;

import com.ejemplo.model.ArchivoModel;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

@WebServlet("/SubirArchivoController")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2,
    maxFileSize = 1024 * 1024 * 10,
    maxRequestSize = 1024 * 1024 * 50
)
public class SubirArchivoController extends HttpServlet {

    private static final String UPLOAD_DIR = "uploads";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String applicationPath = request.getServletContext().getRealPath("");
        String uploadFilePath = applicationPath + File.separator + UPLOAD_DIR;

        File fileSaveDir = new File(uploadFilePath);
        if (!fileSaveDir.exists()) fileSaveDir.mkdirs();

        try {
            // Leemos todas las partes enviadas en la petición HTTP
            Collection<Part> parts = request.getParts();
            int contadorSubidos = 0;
            
            for (Part part : parts) {
                // Verificamos que la parte corresponda al campo "archivo" y contenga datos
                if (part.getName().equals("archivo") && part.getSize() > 0) {
                    
                    String fileName = getFileName(part);
                    String nombreFinal = fileName;
                    File archivoFisico = new File(uploadFilePath + File.separator + nombreFinal);

                    // Algoritmo de control de duplicados numéricos
                    int contador = 1;
                    while (archivoFisico.exists()) {
                        int dotIndex = fileName.lastIndexOf(".");
                        String nombreSinExtension = (dotIndex != -1) ? fileName.substring(0, dotIndex) : fileName;
                        String extension = (dotIndex != -1) ? fileName.substring(dotIndex) : "";

                        nombreFinal = nombreSinExtension + "(" + contador + ")" + extension;
                        archivoFisico = new File(uploadFilePath + File.separator + nombreFinal);
                        contador++;
                    }

                    // Escritura en el sistema de archivos local del contenedor
                    String savePath = uploadFilePath + File.separator + nombreFinal;
                    part.write(savePath);

                    // Registro en la base de datos relacional MySQL
                    ArchivoModel modelo = new ArchivoModel();
                    boolean guardadoEnBD = modelo.insertarArchivoBD(nombreFinal, part.getContentType(), savePath);

                    if (!guardadoEnBD) {
                        throw new Exception("Error al registrar en MySQL el archivo: " + nombreFinal);
                    }
                    
                    contadorSubidos++;
                }
            }

            if (contadorSubidos > 0) {
                out.print("{\"status\":\"success\", \"mensaje\":\"" + contadorSubidos + " archivos subidos correctamente\"}");
            } else {
                out.print("{\"status\":\"error\", \"mensaje\":\"No se recibió ningún archivo válido\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\":\"error\", \"mensaje\":\"" + e.getMessage() + "\"}");
        }
    }

    private String getFileName(Part part) {
        for (String content : part.getHeader("content-disposition").split(";")) {
            if (content.trim().startsWith("filename")) {
                return content.substring(content.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return "archivo";
    }
}