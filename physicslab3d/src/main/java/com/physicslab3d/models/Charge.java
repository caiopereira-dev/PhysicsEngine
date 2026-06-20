package com.physicslab3d.models;

/**
 * Modelo de uma Carga Elétrica.
 *
 * Representa uma carga puntual com magnitude, sinal e posição no espaço.
 * Usada nas simulações de campo elétrico e interação entre cargas.
 *
 * Convenção:
 *   - Carga positiva (q > 0): as linhas de campo saem da carga
 *   - Carga negativa (q < 0): as linhas de campo entram na carga
 */
public class Charge {

    private final String id;
    private double value;   // Valor da carga em Coulombs (pode ser negativo)
    private double x;       // Posição no eixo X (em unidades arbitrárias)
    private double y;       // Posição no eixo Y
    private double z;       // Posição no eixo Z

    public Charge(String id, double value, double x, double y, double z) {
        this.id = id;
        this.value = value;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // --- Getters e Setters ---

    public String getId() {
        return id;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getZ() { return z; }
    public void setZ(double z) { this.z = z; }

    /**
     * Verifica se a carga é positiva.
     */
    public boolean isPositive() {
        return value > 0;
    }

    /**
     * Verifica se a carga é negativa.
     */
    public boolean isNegative() {
        return value < 0;
    }

    /**
     * Retorna o tipo como string: "positiva" ou "negativa"
     */
    public String getType() {
        return value >= 0 ? "positiva" : "negativa";
    }

    /**
     * Calcula a distância até outra carga.
     */
    public double distanceTo(Charge other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        double dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    @Override
    public String toString() {
        return String.format("Carga[%s] = %.2e C em (%.2f, %.2f, %.2f)", id, value, x, y, z);
    }
}
