package com.physicslab3d.physics;

import java.util.List;

/**
 * Cálculos para associação de resistores em série e em paralelo.
 *
 * SÉRIE:
 *   Req = R1 + R2 + R3 + ... + Rn
 *   A corrente é a mesma em todos; a tensão se divide.
 *
 * PARALELO:
 *   1/Req = 1/R1 + 1/R2 + 1/R3 + ... + 1/Rn
 *   A tensão é a mesma em todos; a corrente se divide.
 */
public class ResistorCircuit {

    /**
     * Calcula a resistência equivalente de resistores em SÉRIE.
     *
     * Em série, as resistências simplesmente somam.
     * Isso acontece porque os elétrons precisam passar por cada resistor
     * um após o outro — cada um acrescenta dificuldade ao fluxo.
     *
     * @param resistors Lista de valores de resistência em Ohms
     * @return          Resistência equivalente em Ohms
     */
    public double seriesEquivalent(List<Double> resistors) {
        if (resistors == null || resistors.isEmpty()) {
            throw new IllegalArgumentException("A lista de resistores não pode estar vazia.");
        }

        double total = 0;
        for (double r : resistors) {
            if (r <= 0) {
                throw new IllegalArgumentException("Valores de resistência devem ser positivos.");
            }
            total += r;
        }
        return total;
    }

    /**
     * Calcula a resistência equivalente de resistores em PARALELO.
     *
     * Em paralelo, o inverso das resistências somam.
     * Mais caminhos disponíveis para os elétrons → menor resistência total.
     *
     * Fórmula: 1/Req = 1/R1 + 1/R2 + ... + 1/Rn
     *
     * @param resistors Lista de valores de resistência em Ohms
     * @return          Resistência equivalente em Ohms
     */
    public double parallelEquivalent(List<Double> resistors) {
        if (resistors == null || resistors.isEmpty()) {
            throw new IllegalArgumentException("A lista de resistores não pode estar vazia.");
        }

        double sumOfInverses = 0;
        for (double r : resistors) {
            if (r <= 0) {
                throw new IllegalArgumentException("Valores de resistência devem ser positivos.");
            }
            sumOfInverses += 1.0 / r;
        }

        // Req = 1 / (1/R1 + 1/R2 + ...)
        return 1.0 / sumOfInverses;
    }

    /**
     * Para dois resistores em paralelo, existe uma fórmula mais simples:
     * Req = (R1 × R2) / (R1 + R2)  — "produto sobre soma"
     *
     * @param r1 Primeira resistência em Ohms
     * @param r2 Segunda resistência em Ohms
     * @return   Resistência equivalente em Ohms
     */
    public double parallelTwoResistors(double r1, double r2) {
        if (r1 <= 0 || r2 <= 0) {
            throw new IllegalArgumentException("Valores de resistência devem ser positivos.");
        }
        return (r1 * r2) / (r1 + r2);
    }
}
