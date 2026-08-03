'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle, FileText, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile, deleteFile } from '@/lib/storage/upload';

interface FileUploadProps {
  bucket: string;
  folderId: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  variant?: 'image' | 'document';
  path?: string;
  onPathChange?: (path: string) => void;
  className?: string;
  hint?: string;
}

export function FileUpload({
  bucket,
  folderId,
  value,
  onChange,
  label,
  accept = 'image/*',
  allowedTypes,
  maxSizeMB = 10,
  variant = 'image',
  path: existingPath,
  onPathChange,
  className,
  hint,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(existingPath ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    if (currentPath) {
      await deleteFile(bucket, currentPath);
    }

    const result = await uploadFile(bucket, folderId, file, { allowedTypes, maxSizeMB });
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCurrentPath(result.path);
    onPathChange?.(result.path);
    onChange(result.url);
  }, [bucket, folderId, currentPath, allowedTypes, maxSizeMB, onChange, onPathChange]);

  const handleRemove = useCallback(async () => {
    if (currentPath) {
      await deleteFile(bucket, currentPath);
    }
    setCurrentPath('');
    onPathChange?.('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }, [bucket, currentPath, onChange, onPathChange]);

  const isImage = variant === 'image';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-semibold text-foreground">{label}</label>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed transition-all',
          isImage ? 'p-6' : 'p-4',
          uploading ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary',
          error && 'border-destructive/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          </div>
        ) : value ? (
          <div className="relative">
            {isImage ? (
              <img src={value} alt="Preview" className="mx-auto max-h-48 rounded-xl object-cover" />
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                <FileText className="h-8 w-8 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">Document uploaded</p>
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    View file
                  </a>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            {isImage ? (
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {isImage ? 'Click to upload an image' : 'Click to upload a document'}
            </p>
            {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
