#!/bin/bash
# ============================================================
# PhysicsLab3D — Script de Compilação e Execução
# ============================================================
#
# Use este script para compilar e iniciar o servidor de uma vez.
# Requisito: Java 11+ instalado e no PATH.
#
# Uso:
#   chmod +x run.sh
#   ./run.sh

set -e  # Interrompe o script se qualquer comando falhar

# ── Cores para o terminal ──
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sem cor

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        ⚡  PhysicsLab3D                  ║${NC}"
echo -e "${CYAN}║   Laboratório Virtual de Eletrodinâmica  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Verifica se o Java está instalado ──
if ! command -v javac &> /dev/null; then
  echo -e "${RED}❌ Java não encontrado. Instale o JDK 11 ou superior.${NC}"
  echo "   Download: https://adoptium.net/"
  exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n1)
echo -e "${GREEN}✓ Java encontrado:${NC} ${JAVA_VERSION}"

# ── Encontra todos os arquivos .java ──
SOURCES=$(find src -name "*.java" 2>/dev/null)

if [ -z "$SOURCES" ]; then
  echo -e "${RED}❌ Nenhum arquivo .java encontrado em src/${NC}"
  exit 1
fi

# ── Cria diretório de saída ──
mkdir -p out

echo ""
echo -e "${YELLOW}⚙️  Compilando...${NC}"

# ── Compila ──
javac -d out -sourcepath src $SOURCES

echo -e "${GREEN}✓ Compilação concluída!${NC}"
echo ""
echo -e "${GREEN}🚀 Iniciando servidor em http://localhost:8080${NC}"
echo -e "   Pressione Ctrl+C para parar."
echo ""

# ── Executa o servidor ──
java -cp out com.physicslab3d.server.Main
