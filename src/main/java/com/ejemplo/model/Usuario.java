package com.ejemplo.model;

public class Usuario {
    private String correo;
    private String password;
    private String estado; // Campo vital para la administración

    public Usuario(String correo, String password) {
        this.correo = correo;
        this.password = password;
        this.estado = "Pendiente";
    }

    public Usuario(String correo, String password, String estado) {
        this.correo = correo;
        this.password = password;
        this.estado = estado;
    }

    // Getters
    public String getCorreo() { return correo; }
    public String getPassword() { return password; }
    public String getEstado() { return estado; }
}