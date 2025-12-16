@echo off
chcp 65001 >nul
echo ================================================================================
echo            🚀 BROWSER SYNC v2.0 - VERSÃO MELHORADA
echo ================================================================================
echo.
echo ✨ NOVAS FUNCIONALIDADES:
echo    • IPs diferentes para cada janela (proxies automáticos)
echo    • Auto-skip de anúncios (YouTube, etc.)
echo    • Prevenção automática de pausas
echo    • Otimizado para YouTube, Spotify, Deezer e TikTok
echo.
echo ⏳ Verificando dependências...
echo.
pip show selenium >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Selenium não encontrado. Instalando dependências...
    pip install -r requirements_browser.txt
    echo.
)
echo ✅ Dependências OK!
echo.
echo 🚀 Iniciando Browser Sync v2.0...
echo.
echo 📝 IMPORTANTE:
echo    1. Primeira execução pode levar 2-3 minutos (busca de proxies)
echo    2. As 20 janelas abrirão em instantes
echo    3. Auto-skip de anúncios: ATIVO
echo    4. Cada janela terá um IP diferente
echo.
echo ⏳ Aguarde...
echo.
python browser_sync_improved.py
echo.
echo ================================================================================
echo 👋 Obrigado por usar o Browser Sync v2.0!
echo ================================================================================
pause
