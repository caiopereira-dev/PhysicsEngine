package com.physicslab3d.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Classe base para os handlers de API.
 *
 * Contém métodos utilitários para ler parâmetros da URL
 * e enviar respostas em formato JSON — sem precisar de bibliotecas externas.
 */
public abstract class BaseHandler implements HttpHandler {

    /**
     * Lê os parâmetros de query string da URL.
     * Exemplo: /api/ohm?voltage=12&resistance=4
     * Retorna: {"voltage": "12", "resistance": "4"}
     */
    protected Map<String, String> parseQueryParams(HttpExchange exchange) {
        Map<String, String> params = new HashMap<>();
        URI uri = exchange.getRequestURI();
        String query = uri.getQuery();

        if (query == null || query.isEmpty()) {
            return params;
        }

        // Separa os pares chave=valor pelo &
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=");
            if (parts.length == 2) {
                params.put(parts[0], parts[1]);
            }
        }

        return params;
    }

    /**
     * Envia uma resposta JSON com status 200 OK.
     */
    protected void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        byte[] responseBytes = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        // Responde preflight de CORS se necessário
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        exchange.sendResponseHeaders(200, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }

    /**
     * Envia uma resposta de erro em JSON.
     */
    protected void sendErrorResponse(HttpExchange exchange, String message) throws IOException {
        String json = "{\"error\": \"" + message + "\"}";
        byte[] responseBytes = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(400, responseBytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }

    /**
     * Lê o corpo (body) de uma requisição POST como string.
     */
    protected String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * Converte um double para string com no máximo 4 casas decimais,
     * removendo zeros desnecessários.
     */
    protected String formatDouble(double value) {
        // Evita notação científica para valores pequenos
        if (Math.abs(value) < 0.0001 && value != 0) {
            return String.format("%.6f", value);
        }
        return String.format("%.4f", value).replaceAll("0+$", "").replaceAll("\\.$", ".0");
    }
}
