'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MarkdownPreview } from '@/components/markdown-preview';
import { MonacoEditor } from '@/components/monaco-editor';
import { Textarea } from '@/components/ui/textarea';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const isStorybook = typeof process !== 'undefined' && process.env.STORYBOOK === 'true';

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 240,
}: MarkdownEditorProps) {
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

      <div style={{ minHeight }}>
        {activeTab === 'edit' ? (
          isStorybook ? (
            <Textarea
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="rounded-none border-none bg-surface-container resize-y min-h-[240px]"
            />
          ) : (
            <div className="h-[240px]">
              <MonacoEditor value={value} onChange={onChange} language="markdown" />
            </div>
          )
        ) : (
          <div className="h-[240px] overflow-auto">
            <MarkdownPreview content={value || '*Nothing to preview*'} />
          </div>
        )}
      </div>
    </div>
  );
}
