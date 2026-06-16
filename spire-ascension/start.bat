@echo off
cd /d "%~dp0"
echo ==============================
echo   尖塔征途 - 本地服务器
echo   浏览器打开: http://localhost:8765
echo   关闭此窗口即停止服务
echo ==============================
python -m http.server 8765
pause
