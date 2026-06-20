package com.physicslab3d.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Handler para servir arquivos estáticos do frontend.
 *
 * Quando o browser faz uma requisição para /index.html, /css/style.css,
 * /js/main.js etc., este handler lê o arquivo do disco e o envia.
 */
public class StaticFileHandler implements HttpHandler {

    // Diretório raiz dos arquivos do frontend
    private static final String FRONTEND_DIR = "frontend";

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String requestPath = exchange.getRequestURI().getPath();

        // Se pedir só "/", redireciona para index.html
        if (requestPath.equals("/")) {
            requestPath = "/index.html";
        }

        // Monta o caminho do arquivo no sistema de arquivos
        Path filePath = Paths.get(FRONTEND_DIR + requestPath);

        if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
            // Detecta o tipo do arquivo para definir o Content-Type correto
            String contentType = detectContentType(requestPath);
            byte[] fileBytes = Files.readAllBytes(filePath);

            exchange.getResponseHeaders().set("Content-Type", contentType);
            // Permite CORS para chamadas da própria página
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, fileBytes.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        } else {
            // Arquivo não encontrado
            String response = "404 - Arquivo não encontrado: " + requestPath;
            exchange.sendResponseHeaders(404, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }

    /**
     * Detecta o Content-Type correto com base na extensão do arquivo.
     * Navegadores precisam disso para renderizar cada tipo corretamente.
     */
    private String detectContentType(String path) {
        if (path.endsWith(".html")) return "text/html; charset=utf-8";
        if (path.endsWith(".css"))  return "text/css; charset=utf-8";
        if (path.endsWith(".js"))   return "application/javascript; charset=utf-8";
        if (path.endsWith(".json")) return "application/json; charset=utf-8";
        if (path.endsWith(".png"))  return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".svg"))  return "image/svg+xml";
        if (path.endsWith(".ico"))  return "image/x-icon";
        return "text/plain; charset=utf-8";
    }
}
