@echo off
REM ============================================================
REM PhysicsLab3D — Script de Compilação e Execução (Windows)
REM ============================================================
REM
REM Uso: Duplo clique ou execute no terminal:
REM   run.bat
REM
REM Requisito: Java 11+ instalado e no PATH do sistema.

echo.
echo ============================================
echo    ^<^>  PhysicsLab3D
echo    Laboratorio Virtual de Eletrodinamica
echo ============================================
echo.

REM Verifica se javac está disponível
where javac >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Java nao encontrado.
    echo Instale o JDK 11 ou superior: https://adoptium.net/
    pause
    exit /b 1
)

echo [OK] Java encontrado.
echo.

REM Cria o diretório de saída
if not exist out mkdir out

echo [>>] Compilando arquivos Java...

REM Coleta todos os .java recursivamente e compila
dir /s /b src\*.java > sources.txt
javac -d out @sources.txt

if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha na compilacao.
    del sources.txt
    pause
    exit /b 1
)

del sources.txt
echo [OK] Compilacao concluida!
echo.
echo [>>] Iniciando servidor em http://localhost:8080
echo      Pressione Ctrl+C para parar.
echo.

java -cp out com.physicslab3d.server.Main

pause
