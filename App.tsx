import React, { useMemo, useState } from 'react';
import { FolderOpen, Search, CalendarDays, MapPin, Image as ImageIcon } from 'lucide-react';
import { buildPhotoItem, normalizeText } from './services/imageService';
import { PhotoFilters, PhotoItem } from './types';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filters, setFilters] = useState<PhotoFilters>({
    keyword: '',
    sourceRoot: 'all',
    yearMonth: 'all',
    location: 'all',
  });

  const handleScanDirectory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    setIsScanning(true);
    const items: PhotoItem[] = [];

    for (const file of files) {
      const photo = await buildPhotoItem(file);
      items.push(photo);
    }

    setPhotos((prev) => [...prev, ...items]);
    setIsScanning(false);
    event.target.value = '';
  };

  const sourceRoots = useMemo(() => ['all', ...new Set(photos.map((p) => p.sourceRoot))], [photos]);
  const yearMonths = useMemo(() => ['all', ...new Set(photos.map((p) => p.yearMonth))], [photos]);
  const locations = useMemo(() => ['all', ...new Set(photos.map((p) => p.locationLabel))], [photos]);

  const filtered = useMemo(() => {
    const keyword = normalizeText(filters.keyword);

    return photos.filter((photo) => {
      const textMatched = !keyword
        || normalizeText(photo.name).includes(keyword)
        || normalizeText(photo.sourcePath).includes(keyword)
        || normalizeText(photo.locationLabel).includes(keyword);

      const rootMatched = filters.sourceRoot === 'all' || photo.sourceRoot === filters.sourceRoot;
      const ymMatched = filters.yearMonth === 'all' || photo.yearMonth === filters.yearMonth;
      const locMatched = filters.location === 'all' || photo.locationLabel === filters.location;

      return textMatched && rootMatched && ymMatched && locMatched;
    });
  }, [photos, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">本機相簿 MVP</h1>
          <p className="text-slate-400">依時間、地點與來源資料夾分類，並可從硬碟目錄批次索引與搜尋。</p>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 cursor-pointer">
            <FolderOpen className="w-4 h-4" />
            選擇根目錄/資料夾掃描
            <input type="file" className="hidden" multiple webkitdirectory="" onChange={handleScanDirectory} />
          </label>
          {isScanning && <p className="text-blue-300">掃描中，正在讀取 EXIF 與建立索引...</p>}

          <div className="grid md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-3 text-slate-400" />
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-2 py-2"
                placeholder="搜尋檔名/路徑/地點"
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              />
            </div>
            <select className="bg-slate-800 border border-slate-700 rounded-lg p-2" value={filters.sourceRoot} onChange={(e) => setFilters((p) => ({ ...p, sourceRoot: e.target.value }))}>
              {sourceRoots.map((root) => <option key={root} value={root}>{root === 'all' ? '全部來源' : root}</option>)}
            </select>
            <select className="bg-slate-800 border border-slate-700 rounded-lg p-2" value={filters.yearMonth} onChange={(e) => setFilters((p) => ({ ...p, yearMonth: e.target.value }))}>
              {yearMonths.map((ym) => <option key={ym} value={ym}>{ym === 'all' ? '全部月份' : ym}</option>)}
            </select>
            <select className="bg-slate-800 border border-slate-700 rounded-lg p-2" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}>
              {locations.map((loc) => <option key={loc} value={loc}>{loc === 'all' ? '全部地點' : loc}</option>)}
            </select>
          </div>
        </section>

        <section>
          <p className="mb-3 text-slate-300">共 {photos.length} 張，符合條件 {filtered.length} 張</p>
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              尚無照片或沒有符合篩選條件的項目。
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((photo) => (
                <article key={photo.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <img src={photo.previewUrl} alt={photo.name} className="w-full h-44 object-cover" />
                  <div className="p-3 space-y-1 text-sm">
                    <p className="font-medium truncate" title={photo.name}>{photo.name}</p>
                    <p className="text-slate-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{photo.yearMonth}</p>
                    <p className="text-slate-400 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{photo.locationLabel}</p>
                    <p className="text-xs text-slate-500 truncate" title={photo.sourcePath}>{photo.sourcePath}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
