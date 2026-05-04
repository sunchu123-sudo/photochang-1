import { PhotoItem } from '../types';

const toYearMonth = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const buildPhotoItem = async (file: File): Promise<PhotoItem> => {
  const takenAt = new Date(file.lastModified);
  const sourcePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  const sourceRoot = sourcePath.includes('/') ? sourcePath.split('/')[0] : '單檔上傳';

  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    sourcePath,
    sourceRoot,
    takenAt,
    yearMonth: toYearMonth(takenAt),
    locationLabel: '無 GPS 資訊（MVP）',
  };
};

export const normalizeText = (text: string): string => text.trim().toLowerCase();
