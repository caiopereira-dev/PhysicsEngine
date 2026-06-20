package com.physicslab3d.server;

import com.physicslab3d.physics.OhmLaw;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

/**
 * Handler da API para a Lei de Ohm.
 *
 * Rota: GET /api/ohm?voltage=X&resistance=Y&current=Z
 *
 * Aceita dois dos três parâmetros e calcula o terceiro.
 * Exemplo: ?voltage=12&resistance=4 → calcula current = 3A
 */
public class OhmHandler extends BaseHandler {

    private final OhmLaw ohmLaw = new OhmLaw();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange);

        try {
            // Verifica quais parâmetros foram fornecidos
            boolean hasVoltage    = params.containsKey("voltage");
            boolean hasResistance = params.containsKey("resistance");
            boolean hasCurrent    = params.containsKey("current");

            double voltage, resistance, current;

            if (hasVoltage && hasResistance) {
                // Calcula corrente: I = V / R
                voltage    = Double.parseDouble(params.get("voltage"));
                resistance = Double.parseDouble(params.get("resistance"));
                current    = ohmLaw.calculateCurrent(voltage, resistance);

            } else if (hasVoltage && hasCurrent) {
                // Calcula resistência: R = V / I
                voltage    = Double.parseDouble(params.get("voltage"));
                current    = Double.parseDouble(params.get("current"));
                resistance = ohmLaw.calculateResistance(voltage, current);

            } else if (hasResistance && hasCurrent) {
                // Calcula tensão: V = R × I
                resistance = Double.parseDouble(params.get("resistance"));
                current    = Double.parseDouble(params.get("current"));
                voltage    = ohmLaw.calculateVoltage(resistance, current);

            } else {
                sendErrorResponse(exchange, "Forneça dois dos três parâmetros: voltage, resistance, current");
                return;
            }

            // Monta o JSON de resposta
            String json = String.format(
                "{\"voltage\": %s, \"resistance\": %s, \"current\": %s, \"power\": %s}",
                formatDouble(voltage),
                formatDouble(resistance),
                formatDouble(current),
                formatDouble(ohmLaw.calculatePower(voltage, current))
            );

            sendJsonResponse(exchange, json);

        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, "Valores numéricos inválidos nos parâmetros.");
        } catch (ArithmeticException e) {
            sendErrorResponse(exchange, e.getMessage());
        }
    }
}
