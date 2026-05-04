export interface PhotoItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  sourcePath: string;
  sourceRoot: string;
  takenAt: Date;
  yearMonth: string;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotoFilters {
  keyword: string;
  sourceRoot: string;
  yearMonth: string;
  location: string;
}
