package com.physicslab3d.server;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpContext;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * PhysicsLab3D - Servidor HTTP Principal
 *
 * Servidor simples que serve os arquivos do frontend e expõe
 * endpoints para os cálculos físicos feitos no backend Java.
 *
 * Autor: estudante de Física e programação
 */
public class Main {

    // Porta padrão do servidor
    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        // Cria o servidor HTTP na porta definida
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Registra os handlers para cada rota
        server.createContext("/", new StaticFileHandler());
        server.createContext("/api/ohm", new OhmHandler());
        server.createContext("/api/resistors/series", new ResistorsSeriesHandler());
        server.createContext("/api/resistors/parallel", new ResistorsParallelHandler());
        server.createContext("/api/electric-field", new ElectricFieldHandler());
        server.createContext("/api/charge-force", new ChargeForceHandler());

        // Usa um pool de threads para lidar com múltiplas requisições
        server.setExecutor(Executors.newFixedThreadPool(4));

        server.start();

        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║       PhysicsLab3D está rodando!     ║");
        System.out.println("║  Acesse: http://localhost:" + PORT + "        ║");
        System.out.println("╚══════════════════════════════════════╝");
    }
}
