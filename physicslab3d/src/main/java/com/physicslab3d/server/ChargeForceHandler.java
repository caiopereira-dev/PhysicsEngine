package com.physicslab3d.server;

import com.physicslab3d.physics.ElectricField;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para força entre cargas (Lei de Coulomb).
 *
 * Rota: GET /api/charge-force?q1=1e-9&q2=-1e-9&distance=0.1
 *
 * Fórmula: F = k × |q1 × q2| / r²
 *
 * O sinal do produto q1×q2 determina se é atração (negativo) ou repulsão (positivo):
 * - Cargas de mesmo sinal: repulsão (F > 0)
 * - Cargas de sinais opostos: atração (F < 0 no produto, mas usamos valor absoluto)
 */
public class ChargeForceHandler extends BaseHandler {

    private final ElectricField field = new ElectricField();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange);

        try {
            double q1       = Double.parseDouble(params.getOrDefault("q1", "1e-9"));
            double q2       = Double.parseDouble(params.getOrDefault("q2", "-1e-9"));
            double distance = Double.parseDouble(params.getOrDefault("distance", "0.1"));

            if (distance <= 0) {
                sendErrorResponse(exchange, "A distância deve ser maior que zero.");
                return;
            }

            double forceMagnitude = field.calculateCoulombForce(q1, q2, distance);

            // Determina se é atração ou repulsão pelo sinal do produto das cargas
            boolean isAttraction = (q1 * q2) < 0;
            String interactionType = isAttraction ? "atracao" : "repulsao";

            String json = String.format(
                "{\"force\": %s, \"interaction\": \"%s\", \"q1\": %s, \"q2\": %s, \"distance\": %s}",
                formatDouble(forceMagnitude),
                interactionType,
                formatDouble(q1),
                formatDouble(q2),
                formatDouble(distance)
            );

            sendJsonResponse(exchange, json);

        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, "Valores numéricos inválidos.");
        }
    }
}
