package com.ejemplo.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

@WebServlet("/api/email/enviar")
@MultipartConfig(maxFileSize = 1024 * 1024 * 10) // Soporta adjuntos de hasta 10MB
public class EnviarEmailController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        try {
            String destinatario = req.getParameter("para");
            String asunto = req.getParameter("asunto");
            String cuerpoHtml = req.getParameter("cuerpo");
            Part archivoAdjunto = req.getPart("adjunto");

            String smtpUser = System.getenv("SMTP_USER");
            String smtpPass = System.getenv("SMTP_PASS");

            if (smtpUser == null || smtpPass == null) {
                throw new Exception("Faltan las variables SMTP_USER y SMTP_PASS en Railway.");
            }

            Properties props = new Properties();
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            Session session = Session.getInstance(props, new Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(smtpUser, smtpPass);
                }
            });

            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(smtpUser, "CloudSpace App"));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
            msg.setSubject(asunto);

            Multipart multipart = new MimeMultipart();

            MimeBodyPart textPart = new MimeBodyPart();
            textPart.setContent(cuerpoHtml, "text/html; charset=utf-8");
            multipart.addBodyPart(textPart);

            if (archivoAdjunto != null && archivoAdjunto.getSize() > 0) {
                MimeBodyPart attachmentPart = new MimeBodyPart();
                InputStream fileContent = archivoAdjunto.getInputStream();
                byte[] bytes = fileContent.readAllBytes();
                
                jakarta.mail.util.ByteArrayDataSource bds = new jakarta.mail.util.ByteArrayDataSource(bytes, archivoAdjunto.getContentType());
                attachmentPart.setDataHandler(new jakarta.activation.DataHandler(bds));
                attachmentPart.setFileName(archivoAdjunto.getSubmittedFileName());
                
                multipart.addBodyPart(attachmentPart);
            }

            msg.setContent(multipart);
            Transport.send(msg);

            res.getWriter().write("{\"status\":\"success\", \"mensaje\":\"Correo enviado con éxito.\"}");

        } catch (Exception e) {
            e.printStackTrace();
            res.getWriter().write("{\"status\":\"error\", \"mensaje\":\"Error al enviar: " + e.getMessage() + "\"}");
        }
    }
}