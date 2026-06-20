package com.physicslab3d.server;

import com.physicslab3d.physics.ElectricField;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para cálculos de campo elétrico.
 *
 * Rota: GET /api/electric-field?charge=1e-9&distance=0.1
 *
 * Calcula a intensidade do campo elétrico gerado por uma carga puntual
 * a uma certa distância.
 *
 * Fórmula: E = k × |q| / r²
 * onde k = 8.99 × 10⁹ N·m²/C² (constante de Coulomb)
 */
public class ElectricFieldHandler extends BaseHandler {

    private final ElectricField field = new ElectricField();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange);

        try {
            double charge   = Double.parseDouble(params.getOrDefault("charge", "1e-9"));
            double distance = Double.parseDouble(params.getOrDefault("distance", "0.1"));

            if (distance <= 0) {
                sendErrorResponse(exchange, "A distância deve ser maior que zero.");
                return;
            }

            double intensity = field.calculateIntensity(charge, distance);
            double potential = field.calculatePotential(charge, distance);
            double energy    = field.calculateEnergy(charge, distance);

            String json = String.format(
                "{\"intensity\": %s, \"potential\": %s, \"energy\": %s, \"charge\": %s, \"distance\": %s}",
                formatDouble(intensity),
                formatDouble(potential),
                formatDouble(energy),
                formatDouble(charge),
                formatDouble(distance)
            );

            sendJsonResponse(exchange, json);

        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, "Valores numéricos inválidos.");
        }
    }
}
