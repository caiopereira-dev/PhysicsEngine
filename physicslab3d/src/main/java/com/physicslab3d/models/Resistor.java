package com.physicslab3d.models;

/**
 * Modelo de um Resistor.
 *
 * Representa um resistor com seu valor em Ohms e um nome/identificador.
 * Usado para organizar os resistores nas simulações de circuito.
 */
public class Resistor {

    private final String id;
    private double resistance; // Em Ohms (Ω)
    private String label;      // Nome para exibição (ex: "R1", "R2")

    public Resistor(String id, double resistance) {
        this.id = id;
        this.resistance = resistance;
        this.label = id;
    }

    public Resistor(String id, double resistance, String label) {
        this.id = id;
        this.resistance = resistance;
        this.label = label;
    }

    // --- Getters e Setters ---

    public String getId() {
        return id;
    }

    public double getResistance() {
        return resistance;
    }

    public void setResistance(double resistance) {
        if (resistance <= 0) {
            throw new IllegalArgumentException("Resistência deve ser positiva.");
        }
        this.resistance = resistance;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @Override
    public String toString() {
        return label + " = " + resistance + " Ω";
    }
}
