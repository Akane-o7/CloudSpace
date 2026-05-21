package com.ejemplo.model;

import java.sql.Timestamp;

public class Archivo {
    private int id;
    private String nombre;
    private String tipo;
    private String ruta;
    private Timestamp fecha;

    public Archivo(int id, String nombre, String tipo, String ruta, Timestamp fecha) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.ruta = ruta;
        this.fecha = fecha;
    }

    // Getters necesarios para que GSON pueda leerlos
    public int getId() { return id; }
    public String getNombre() { return nombre; }
    public String getTipo() { return tipo; }
    public String getRuta() { return ruta; }
    public Timestamp getFecha() { return fecha; }
}
