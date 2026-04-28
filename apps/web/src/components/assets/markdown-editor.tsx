import { useState } from 'react';
import { cn } from '@cellar/ui';
import { MarkdownPreview } from '@/components/common/markdown-preview';
import { CodeMirrorEditor } from '@/components/common/codemirror-editor';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export function MarkdownEditor({ value, onChange, height = 240 }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="rounded-lg bg-surface-container overflow-hidden">
      <div className="flex items-center gap-1 border-b border-outline-variant/10 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={cn(
            'px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'edit'
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface-variant'
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'preview'
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface-variant'
          )}
        >
          Preview
        </button>
      </div>

      <div style={{ height }}>
        {activeTab === 'edit' ? (
          <CodeMirrorEditor value={value} onChange={onChange} language="markdown" />
        ) : (
          <div className="h-full overflow-auto">
            <MarkdownPreview content={value || '*Nothing to preview*'} />
          </div>
        )}
      </div>
    </div>
  );
}
