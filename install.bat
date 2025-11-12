@echo off
echo ========================================
echo Instalacion de Chicho Chatbot PoC
echo ========================================
echo.

echo [1/3] Limpiando instalaciones previas...
if exist node_modules (
    echo Eliminando node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Eliminando package-lock.json...
    del /f /q package-lock.json
)
echo Limpieza completada.
echo.

echo [2/3] Limpiando cache de npm...
cmd /c npm cache clean --force
echo Cache limpiado.
echo.

echo [3/3] Instalando dependencias...
cmd /c npm install
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo Instalacion completada exitosamente!
    echo ========================================
    echo.
    echo Puedes iniciar el servidor con:
    echo   npm start
    echo.
) else (
    echo ========================================
    echo Error durante la instalacion
    echo ========================================
    echo.
    echo Intenta ejecutar manualmente:
    echo   cmd /c npm install --legacy-peer-deps
    echo.
)

pause
