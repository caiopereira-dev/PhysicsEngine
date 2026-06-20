package com.physicslab3d.server;

import com.physicslab3d.physics.ResistorCircuit;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Handler para cálculo de resistores em SÉRIE.
 *
 * Rota: GET /api/resistors/series?values=10,20,30&voltage=12
 *
 * Calcula a resistência equivalente e as correntes para
 * uma associação de resistores em série.
 */
public class ResistorsSeriesHandler extends BaseHandler {

    private final ResistorCircuit circuit = new ResistorCircuit();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange);

        try {
            String valuesParam = params.getOrDefault("values", "");
            double voltage     = Double.parseDouble(params.getOrDefault("voltage", "12"));

            if (valuesParam.isEmpty()) {
                sendErrorResponse(exchange, "Parâmetro 'values' é obrigatório. Ex: ?values=10,20,30");
                return;
            }

            // Converte a string "10,20,30" em uma lista de doubles
            String[] parts = valuesParam.split(",");
            List<Double> resistors = new ArrayList<>();
            for (String part : parts) {
                double val = Double.parseDouble(part.trim());
                if (val <= 0) {
                    sendErrorResponse(exchange, "Valores de resistência devem ser positivos.");
                    return;
                }
                resistors.add(val);
            }

            double equivalent = circuit.seriesEquivalent(resistors);
            double current    = voltage / equivalent; // I = V / Req
            double power      = voltage * current;    // P = V × I

            // Monta a lista de tensões em cada resistor para o JSON
            StringBuilder voltagesJson = new StringBuilder("[");
            for (int i = 0; i < resistors.size(); i++) {
                double vDrop = current * resistors.get(i);
                voltagesJson.append(formatDouble(vDrop));
                if (i < resistors.size() - 1) voltagesJson.append(",");
            }
            voltagesJson.append("]");

            String json = String.format(
                "{\"equivalent\": %s, \"current\": %s, \"voltage\": %s, \"power\": %s, \"voltageDrops\": %s}",
                formatDouble(equivalent),
                formatDouble(current),
                formatDouble(voltage),
                formatDouble(power),
                voltagesJson
            );

            sendJsonResponse(exchange, json);

        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, "Valores numéricos inválidos.");
        }
    }
}
