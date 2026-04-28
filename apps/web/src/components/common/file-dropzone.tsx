import { useState, useRef } from 'react';
import { Upload, Loader2, File } from 'lucide-react';

export function FileDropzone({
  onUpload,
  accept,
}: {
  onUpload: (data: {
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: globalThis.File) {
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setError(null);
      onUpload(data);
    } else {
      const err = await res.json().catch(() => ({}));
      setError((err as { error?: string }).error ?? 'Upload failed');
    }
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant/30 hover:border-outline-variant/60'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-outline">Uploading {fileName}...</p>
        </>
      ) : fileName ? (
        <>
          <File className="h-8 w-8 text-primary" />
          <p className="text-xs text-slate-200">{fileName}</p>
          <p className="text-[10px] text-outline">Click to replace</p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-outline" />
          <p className="text-xs text-on-surface-variant">Drop a file here or click to browse</p>
        </>
      )}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
