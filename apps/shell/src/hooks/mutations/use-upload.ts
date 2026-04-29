import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../lib/api-fetch';

export type UploadResponse = {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export function useUploadFileMutation() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/vault/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      if (!response.ok) {
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = null;
        }
        const message =
          body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Upload failed';
        throw new ApiError(response.status, message, body);
      }
      return response.json();
    },
  });
}
