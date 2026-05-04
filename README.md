# 本機相簿 MVP

這是一個可在本機執行的相簿工具（目前為 MVP）。

## 功能
- 掃描硬碟中的指定目錄（可選根目錄或子目錄）
- 依照片時間（年月）分類
- 依來源資料夾分類
- 關鍵字搜尋（檔名 / 路徑 / 地點欄位）

## 第一次使用（Windows / macOS）

### 直接雙擊啟動
- **Windows**：雙擊 `run-photo-album.bat`
- **macOS**：雙擊 `run-photo-album.command`

啟動器會自動：
1. 執行 `npm install`
2. 啟動開發伺服器 `npm run dev`
3. 自動開啟 `http://localhost:5173`

## 手動啟動
```bash
npm install
npm run dev
```

## 打包說明
目前此版本提供「雙擊啟動器」的本機桌面使用體驗。
若你要真正 `.exe` / `.dmg` 單檔安裝包，我可以下一版幫你整合 Electron/Tauri 打包流程。
