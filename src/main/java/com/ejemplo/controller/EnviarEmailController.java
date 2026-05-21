package com.ejemplo.controller;

import java.io.BufferedReader;
import java.io.IOException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/email/enviar")
public class EnviarEmailController extends HttpServlet {
    
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        try {
            // 1. Leer el JSON enviado por el Frontend
            BufferedReader reader = req.getReader();
            JsonObject emailRequest = gson.fromJson(reader, JsonObject.class);
            
            String destinatario = emailRequest.get("para").getAsString();
            String asunto = emailRequest.get("asunto").getAsString();
            String cuerpo = emailRequest.get("cuerpo").getAsString();

            // ==============================================================
            // TODO: AQUÍ IRÁ LA LÓGICA DE JAKARTA MAIL CUANDO ESTÉS EN RAILWAY
            // Ej: Session session = Session.getInstance(props, auth);
            //     Message msg = new MimeMessage(session);
            //     msg.setRecipients(Message.RecipientType.TO, destinatario);
            //     Transport.send(msg);
            // ==============================================================

            // Por ahora, simulamos el envío imprimiendo en la consola del servidor (Docker)
            System.out.println("====== MOCK DE ENVÍO DE CORREO ======");
            System.out.println("Para: " + destinatario);
            System.out.println("Asunto: " + asunto);
            System.out.println("Cuerpo HTML: " + cuerpo);
            System.out.println("=====================================");

            // 2. Responder al Frontend que ha sido un éxito
            JsonObject response = new JsonObject();
            response.addProperty("status", "success");
            response.addProperty("mensaje", "Simulación: Correo procesado para " + destinatario);
            res.getWriter().write(response.toString());

        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("status", "error");
            error.addProperty("mensaje", "Error al procesar la petición de correo.");
            res.getWriter().write(error.toString());
        }
    }
}