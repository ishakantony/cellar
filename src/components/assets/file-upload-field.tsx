'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { X, File, RefreshCw } from 'lucide-react';

import { FileDropzone } from '@/components/file-dropzone';

export interface FileUploadValue {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface FileUploadFieldProps {
  value?: FileUploadValue | null;
  onChange: (value: FileUploadValue | null) => void;
  accept?: string;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadField({ value, onChange, accept, error }: FileUploadFieldProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isImage = value?.mimeType?.startsWith('image/');

  const handleUpload = useCallback(
    (data: FileUploadValue) => {
      setUploadError(null);
      onChange(data);
    },
    [onChange]
  );

  const handleError = useCallback((err: string) => {
    setUploadError(err);
  }, []);

  const handleClear = useCallback(() => {
    setUploadError(null);
    onChange(null);
  }, [onChange]);

  // Wrap FileDropzone to intercept errors
  const handleDropzoneUpload = useCallback(
    (data: FileUploadValue) => {
      handleUpload(data);
    },
    [handleUpload]
  );

  if (!value) {
    return (
      <div>
        <FileDropzone onUpload={handleDropzoneUpload} accept={accept} />
        {(error || uploadError) && (
          <p className="text-xs text-error mt-1">{error || uploadError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-container p-4">
      <div className="flex items-start gap-4">
        {isImage ? (
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
            <Image
              src={`/api/files/${value.filePath}`}
              alt={value.fileName}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <File className="h-8 w-8 text-outline" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{value.fileName}</p>
          <p className="text-[10px] text-outline mt-0.5">
            {value.mimeType} • {formatFileSize(value.fileSize)}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-error hover:bg-error/10 transition-colors"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
            <label className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors cursor-pointer">
              <RefreshCw className="h-3 w-3" />
              Replace
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  fetch('/api/upload', { method: 'POST', body: formData })
                    .then(async res => {
                      if (res.ok) {
                        const data = await res.json();
                        handleUpload(data);
                      } else {
                        const err = await res.json().catch(() => ({}));
                        handleError((err as { error?: string }).error ?? 'Upload failed');
                      }
                    })
                    .catch(() => handleError('Upload failed'));
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {(error || uploadError) && <p className="text-xs text-error mt-2">{error || uploadError}</p>}
    </div>
  );
}
