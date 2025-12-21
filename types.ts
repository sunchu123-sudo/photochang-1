
export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif';

export interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  targetFormat: ImageFormat;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  resultUrl?: string;
  originalSize: number;
  aiSuggestedName?: string;
}

export const SUPPORTED_FORMATS: { label: string; value: ImageFormat }[] = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
  { label: 'AVIF', value: 'image/avif' },
];
