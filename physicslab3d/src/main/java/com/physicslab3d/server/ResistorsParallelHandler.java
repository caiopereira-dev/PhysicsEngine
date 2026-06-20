package com.physicslab3d.server;

import com.physicslab3d.physics.ResistorCircuit;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Handler para cálculo de resistores em PARALELO.
 *
 * Rota: GET /api/resistors/parallel?values=10,20,30&voltage=12
 *
 * Em paralelo, a tensão é a mesma em todos os resistores,
 * mas a corrente se divide.
 */
public class ResistorsParallelHandler extends BaseHandler {

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

            double equivalent   = circuit.parallelEquivalent(resistors);
            double totalCurrent = voltage / equivalent; // I_total = V / Req
            double power        = voltage * totalCurrent;

            // Em paralelo, a corrente em cada ramo é I_n = V / R_n
            StringBuilder currentsJson = new StringBuilder("[");
            for (int i = 0; i < resistors.size(); i++) {
                double branchCurrent = voltage / resistors.get(i);
                currentsJson.append(formatDouble(branchCurrent));
                if (i < resistors.size() - 1) currentsJson.append(",");
            }
            currentsJson.append("]");

            String json = String.format(
                "{\"equivalent\": %s, \"totalCurrent\": %s, \"voltage\": %s, \"power\": %s, \"branchCurrents\": %s}",
                formatDouble(equivalent),
                formatDouble(totalCurrent),
                formatDouble(voltage),
                formatDouble(power),
                currentsJson
            );

            sendJsonResponse(exchange, json);

        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, "Valores numéricos inválidos.");
        }
    }
}
