import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseJsonDropOptions {
  /** Called with the file contents when a valid .json file is dropped. */
  onChange: (text: string) => void;
}

export interface UseJsonDropReturn {
  /** True while a file is dragged over the drop target. */
  isDragOver: boolean;
  /** Spread these on the element that should accept drops. */
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void;
    onDragEnter: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
}

/**
 * Native HTML5 drag-and-drop for .json files.
 *
 * - Accepts `.json` files and calls `onChange` with the file text.
 * - Rejects non-.json files with a toast.
 * - No external library — uses native DragEvent APIs.
 *
 * A ref tracks nesting depth so entering/leaving child elements does not
 * cause isDragOver to flicker.
 */
export function useJsonDrop({ onChange }: UseJsonDropOptions): UseJsonDropReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  // Ref (not state) — depth changes don't need their own render.
  const depthRef = useRef(0);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    depthRef.current += 1;
    if (depthRef.current === 1) setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    depthRef.current -= 1;
    if (depthRef.current <= 0) {
      depthRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      depthRef.current = 0;
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      // Only handle the first file.
      const file = files[0];

      if (!file.name.endsWith('.json')) {
        toast.error(`"${file.name}" is not a .json file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        onChange(text);
        toast.success(`Loaded "${file.name}"`);
      };
      reader.onerror = () => {
        toast.error(`Failed to read "${file.name}"`);
      };
      reader.readAsText(file);
    },
    [onChange]
  );

  return {
    isDragOver,
    dragHandlers: { onDragOver, onDragEnter, onDragLeave, onDrop },
  };
}
