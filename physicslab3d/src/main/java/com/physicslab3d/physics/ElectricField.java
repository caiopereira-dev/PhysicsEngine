package com.physicslab3d.physics;

/**
 * Cálculos de Campo Elétrico e Lei de Coulomb.
 *
 * O campo elétrico descreve como uma carga elétrica afeta o espaço ao seu redor.
 * Uma carga de teste positiva colocada em qualquer ponto do campo sentiria
 * uma força na direção das linhas de campo.
 *
 * Constantes utilizadas:
 *   k = 8.9875 × 10⁹ N·m²/C²  (Constante de Coulomb)
 *   ε₀ = 8.854 × 10⁻¹² C²/N·m² (Permissividade do vácuo)
 */
public class ElectricField {

    // Constante de Coulomb (k = 1 / 4πε₀)
    private static final double COULOMB_CONSTANT = 8.9875e9;

    /**
     * Calcula a intensidade do campo elétrico gerado por uma carga puntual.
     *
     * Fórmula: E = k × |q| / r²
     *
     * Unidade: N/C ou V/m
     *
     * @param charge   Carga elétrica em Coulombs (pode ser negativa)
     * @param distance Distância ao ponto em metros
     * @return         Intensidade do campo em N/C
     */
    public double calculateIntensity(double charge, double distance) {
        if (distance <= 0) {
            throw new IllegalArgumentException("A distância deve ser maior que zero.");
        }
        // Usamos o valor absoluto da carga — a intensidade não depende do sinal
        return COULOMB_CONSTANT * Math.abs(charge) / (distance * distance);
    }

    /**
     * Calcula o potencial elétrico gerado por uma carga puntual.
     *
     * Fórmula: V = k × q / r
     *
     * Diferente da intensidade, o potencial preserva o sinal da carga.
     * Unidade: Volts [V]
     *
     * @param charge   Carga elétrica em Coulombs
     * @param distance Distância ao ponto em metros
     * @return         Potencial elétrico em Volts
     */
    public double calculatePotential(double charge, double distance) {
        if (distance <= 0) {
            throw new IllegalArgumentException("A distância deve ser maior que zero.");
        }
        return COULOMB_CONSTANT * charge / distance;
    }

    /**
     * Calcula a energia potencial elétrica entre duas cargas.
     *
     * Fórmula: U = k × q × q_ref / r
     * (Assumindo uma carga de referência de 1C para simplificar)
     *
     * @param charge   Carga principal em Coulombs
     * @param distance Distância em metros
     * @return         Energia potencial em Joules
     */
    public double calculateEnergy(double charge, double distance) {
        if (distance <= 0) {
            throw new IllegalArgumentException("A distância deve ser maior que zero.");
        }
        // U = k × q / r (energia de uma carga unitária no campo)
        return COULOMB_CONSTANT * charge / distance;
    }

    /**
     * Calcula a força eletrostática entre duas cargas (Lei de Coulomb).
     *
     * Fórmula: Fel = k × |q1 × q2| / r²
     *
     * - Se q1 e q2 têm sinais iguais: repulsão
     * - Se q1 e q2 têm sinais opostos: atração
     *
     * @param q1       Primeira carga em Coulombs
     * @param q2       Segunda carga em Coulombs
     * @param distance Distância entre as cargas em metros
     * @return         Magnitude da força em Newtons
     */
    public double calculateCoulombForce(double q1, double q2, double distance) {
        if (distance <= 0) {
            throw new IllegalArgumentException("A distância deve ser maior que zero.");
        }
        return COULOMB_CONSTANT * Math.abs(q1 * q2) / (distance * distance);
    }

    /**
     * Retorna a constante de Coulomb.
     * Útil para o frontend exibir o valor nas explicações.
     */
    public double getCoulombConstant() {
        return COULOMB_CONSTANT;
    }
}
