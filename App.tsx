
import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  Info,
  Sparkles,
  Files,
  Loader2
} from 'lucide-react';
import { FileItem, ImageFormat, SUPPORTED_FORMATS } from './types';
import { convertImage, formatBytes } from './services/imageService';
import { GoogleGenAI } from "@google/genai";

const MAX_FILES = 10;

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [globalFormat, setGlobalFormat] = useState<ImageFormat>('image/png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Explicitly cast to File[] to ensure correct typing for the mapping function
    const selectedFiles = Array.from(event.target.files || []) as File[];
    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`一次最多只能上傳 ${MAX_FILES} 張照片。目前已上傳 ${files.length} 張。`);
      return;
    }

    const newFiles: FileItem[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      targetFormat: globalFormat,
      status: 'idle',
      progress: 0,
      originalSize: file.size
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileFormat = (id: string, format: ImageFormat) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, targetFormat: format } : f));
  };

  const startConversion = async () => {
    setShowConfirm(false);
    setIsProcessing(true);

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const fileItem = updatedFiles[i];
      if (fileItem.status === 'completed') continue;

      try {
        // Step 1: Start
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing', progress: 10 } : f));
        
        // Simulate a bit of progress for visual feedback
        await new Promise(r => setTimeout(r, 100));
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 40 } : f));

        const blob = await convertImage(fileItem.file, fileItem.targetFormat);
        
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 85 } : f));
        
        const resultUrl = URL.createObjectURL(blob);

        setFiles(prev => prev.map(f => f.id === fileItem.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          resultUrl 
        } : f));
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', progress: 0 } : f));
      }
    }

    setIsProcessing(false);
  };

  const downloadAll = () => {
    files.forEach(file => {
      if (file.resultUrl) {
        const link = document.createElement('a');
        link.href = file.resultUrl;
        const extension = file.targetFormat.split('/')[1];
        const originalName = file.file.name.split('.')[0];
        link.download = `${originalName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>高效、安全、純前端轉換</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          PixelMorph
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          專業的批次圖片轉換工具。支持 PNG, JPG, WebP 及 AVIF。
          所有操作均在瀏覽器內完成，確保您的隱私。
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              上傳照片
            </h2>
            
            <div 
              onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed transition-all duration-300 rounded-xl p-8 text-center group ${
                files.length >= MAX_FILES 
                  ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed' 
                  : 'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 hover:scale-[1.02] cursor-pointer'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                multiple 
                accept="image/*"
                className="hidden" 
                disabled={files.length >= MAX_FILES}
              />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  files.length >= MAX_FILES ? 'bg-slate-800' : 'bg-slate-800 group-hover:bg-blue-500/20 group-hover:rotate-6'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors ${
                    files.length >= MAX_FILES ? 'text-slate-600' : 'text-slate-400 group-hover:text-blue-400'
                  }`} />
                </div>
                
                <p className={`text-sm font-medium mb-1 transition-colors ${
                  files.length >= MAX_FILES ? 'text-slate-500' : 'text-slate-300 group-hover:text-blue-200'
                }`}>
                  {files.length >= MAX_FILES ? '上傳額度已滿' : '點擊或拖放圖片'}
                </p>
                
                <div className="flex flex-col items-center mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Files className={`w-3.5 h-3.5 ${files.length >= MAX_FILES ? 'text-red-400' : 'text-slate-500'}`} />
                    <span className={`text-xs font-bold tracking-wider ${
                      files.length >= MAX_FILES ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {files.length} / {MAX_FILES} 張
                    </span>
                  </div>
                  
                  <div className="w-full max-w-[140px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${
                        files.length >= MAX_FILES ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                      }`}
                      style={{ width: `${(files.length / MAX_FILES) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 pointer-events-none" />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                設定
                <div className="h-[1px] flex-1 bg-slate-800" />
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">預設目標格式</label>
                  <select 
                    value={globalFormat}
                    onChange={(e) => {
                      const val = e.target.value as ImageFormat;
                      setGlobalFormat(val);
                      setFiles(prev => prev.map(f => ({ ...f, targetFormat: val })));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-slate-600"
                  >
                    {SUPPORTED_FORMATS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {files.length > 0 && !isProcessing && (
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              開始轉換 {files.length} 張圖片
            </button>
          )}

          {files.some(f => f.status === 'completed') && (
            <button 
              onClick={downloadAll}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              下載所有已轉換圖片
            </button>
          )}
        </div>

        <div className="lg:col-span-2">
          {files.length === 0 ? (
            <div className="h-full min-h-[400px] border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 backdrop-blur-sm">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>尚未選擇任何圖片</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  待處理清單 
                  <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
                    {files.length} / {MAX_FILES}
                  </span>
                </h2>
                <button 
                  onClick={() => setFiles([])}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  清空全部
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col"
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-800 shrink-0">
                      <img 
                        src={file.previewUrl} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt="Preview" 
                      />
                      
                      {/* Status Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {file.status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px]">
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">處理中</span>
                            <span className="text-[10px] text-blue-300/70">{file.progress}%</span>
                          </div>
                        </div>
                      )}

                      {file.status === 'completed' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/40 backdrop-blur-[1px]">
                          <div className="bg-emerald-500 text-white p-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <span className="mt-2 text-xs font-bold text-emerald-400 tracking-wider">轉換成功</span>
                        </div>
                      )}

                      <button 
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'processing'}
                        className="absolute top-2 left-2 p-1.5 bg-slate-900/80 hover:bg-red-500 text-slate-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:hidden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium truncate max-w-[150px]" title={file.file.name}>
                          {file.file.name}
                        </span>
                        <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded">{formatBytes(file.originalSize)}</span>
                      </div>

                      {/* Progress Bar (Visible during processing and completion) */}
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${file.status === 'completed' ? 'text-emerald-400' : 'text-blue-400'}`}>
                              {file.status === 'completed' ? '完成' : '轉換進度'}
                            </span>
                            <span className={`text-[10px] font-mono ${file.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {file.progress}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ease-out ${
                                file.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-auto">
                        <div className="flex-1">
                          <select 
                            disabled={file.status === 'processing' || file.status === 'completed'}
                            value={file.targetFormat}
                            onChange={(e) => updateFileFormat(file.id, e.target.value as ImageFormat)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none disabled:opacity-50 hover:border-slate-600 transition-colors cursor-pointer"
                          >
                            {SUPPORTED_FORMATS.map(f => (
                              <option key={f.value} value={f.value}>轉為 {f.label}</option>
                            ))}
                          </select>
                        </div>
                        {file.status === 'completed' && file.resultUrl && (
                          <a 
                            href={file.resultUrl} 
                            download={`${file.file.name.split('.')[0]}.${file.targetFormat.split('/')[1]}`}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-all shadow-sm active:scale-90"
                            title="下載單個檔案"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">確認開始轉換？</h3>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                轉換後的檔案將自動下載至您的：
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-semibold bg-blue-500/10 p-2 rounded-lg">
                <Download className="w-4 h-4" />
                <span>預設「下載」資料夾</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">
                * 由於瀏覽器安全性限制，網頁小工具無法直接指定本機儲存路徑。
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={startConversion}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-colors"
              >
                確認並開始
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
        <p>© 2024 PixelMorph AI. 隱私優先，無伺服器上傳。</p>
      </footer>
    </div>
  );
};

export default App;
