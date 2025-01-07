export interface StorageObject {
  id: string;
  created_at: string;
  name: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
  bucket_id: string;
}

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface StorageDownloadOptions {
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;
    format?: 'origin' | 'auto';
  };
}