@echo off
cd /d %~dp0
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js/npm 未安裝，請先安裝 Node.js LTS。
  pause
  exit /b 1
)

echo [1/2] 安裝相依套件...
call npm install
if %errorlevel% neq 0 (
  echo [ERROR] npm install 失敗。
  pause
  exit /b 1
)

echo [2/2] 啟動本機相簿（瀏覽器版）...
start http://localhost:5173
call npm run dev
