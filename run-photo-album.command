#!/bin/bash
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] Node.js/npm 未安裝，請先安裝 Node.js LTS。"
  read -r -p "按 Enter 結束..."
  exit 1
fi

echo "[1/2] 安裝相依套件..."
npm install || { echo "[ERROR] npm install 失敗"; read -r -p "按 Enter 結束..."; exit 1; }

echo "[2/2] 啟動本機相簿（瀏覽器版）..."
open "http://localhost:5173"
npm run dev
