@echo off
echo ====================================
echo Limpando servidores Next.js...
echo ====================================
echo.

echo Matando processos Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Processos Node encerrados
) else (
    echo ℹ Nenhum processo Node encontrado
)
echo.

echo Limpando cache do Next.js...
cd packages\web
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache limpo
) else (
    echo ℹ Cache já estava limpo
)
cd ..\..
echo.

echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul
echo.

echo ====================================
echo Iniciando servidor de desenvolvimento...
echo ====================================
echo.
yarn web
