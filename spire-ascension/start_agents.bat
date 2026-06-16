@echo off
chcp 65001 >nul
cd /d "%~dp0customer_service_agent"

echo ========================================
echo   智能体网页服务启动
echo ========================================
echo.
echo [1] 电商售后客服  - 端口 8501
echo [2] 技术面试模拟官 - 端口 8502
echo [3] 同时启动两个
echo.

set /p choice=请选择 (1/2/3): 

if "%choice%"=="1" goto cs
if "%choice%"=="2" goto iv
if "%choice%"=="3" goto both
goto cs

:cs
echo.
echo 客服地址: http://localhost:8501
echo 局域网分享: http://你的电脑IP:8501
echo.
call .venv\Scripts\streamlit run app.py --server.address 0.0.0.0 --server.port 8501
goto end

:iv
cd /d "%~dp0tech_interview_agent"
echo.
echo 面试官地址: http://localhost:8502
echo 局域网分享: http://你的电脑IP:8502
echo.
call ..\customer_service_agent\.venv\Scripts\streamlit run app.py --server.address 0.0.0.0 --server.port 8502
goto end

:both
start "客服-8501" cmd /k "cd /d %~dp0customer_service_agent && .venv\Scripts\streamlit run app.py --server.address 0.0.0.0 --server.port 8501"
timeout /t 3 >nul
start "面试官-8502" cmd /k "cd /d %~dp0tech_interview_agent && ..\customer_service_agent\.venv\Scripts\streamlit run app.py --server.address 0.0.0.0 --server.port 8502"
echo.
echo 客服:     http://localhost:8501
echo 面试官:   http://localhost:8502
echo 局域网:   http://你的电脑IP:8501 和 :8502
echo.

:end
pause
