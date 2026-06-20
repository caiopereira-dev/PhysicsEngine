package com.physicslab3d.physics;

/**
 * Implementação da Lei de Ohm e cálculos relacionados.
 *
 * A Lei de Ohm relaciona três grandezas fundamentais dos circuitos:
 *   V = R × I
 *   (Tensão = Resistência × Corrente)
 *
 * Unidades utilizadas:
 *   - Tensão (V): Volts [V]
 *   - Corrente (I): Amperes [A]
 *   - Resistência (R): Ohms [Ω]
 *   - Potência (P): Watts [W]
 */
public class OhmLaw {

    /**
     * Calcula a corrente elétrica dado a tensão e a resistência.
     *
     * Fórmula: I = V / R
     *
     * @param voltage    Tensão em Volts
     * @param resistance Resistência em Ohms
     * @return           Corrente em Amperes
     */
    public double calculateCurrent(double voltage, double resistance) {
        if (resistance == 0) {
            throw new ArithmeticException("Resistência não pode ser zero (causaria curto-circuito).");
        }
        return voltage / resistance;
    }

    /**
     * Calcula a tensão dado a resistência e a corrente.
     *
     * Fórmula: V = R × I
     *
     * @param resistance Resistência em Ohms
     * @param current    Corrente em Amperes
     * @return           Tensão em Volts
     */
    public double calculateVoltage(double resistance, double current) {
        return resistance * current;
    }

    /**
     * Calcula a resistência dado a tensão e a corrente.
     *
     * Fórmula: R = V / I
     *
     * @param voltage  Tensão em Volts
     * @param current  Corrente em Amperes
     * @return         Resistência em Ohms
     */
    public double calculateResistance(double voltage, double current) {
        if (current == 0) {
            throw new ArithmeticException("Corrente não pode ser zero para calcular resistência.");
        }
        return voltage / current;
    }

    /**
     * Calcula a potência elétrica dissipada.
     *
     * Fórmula: P = V × I (equivale a P = R × I² = V² / R)
     *
     * @param voltage  Tensão em Volts
     * @param current  Corrente em Amperes
     * @return         Potência em Watts
     */
    public double calculatePower(double voltage, double current) {
        return voltage * current;
    }

    /**
     * Calcula a potência usando resistência e corrente.
     *
     * Fórmula: P = R × I²
     */
    public double calculatePowerByResistance(double resistance, double current) {
        return resistance * current * current;
    }
}
