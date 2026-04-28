import { useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssetType } from '@cellar/shared';
import { CreateAssetSchema, UpdateAssetSchema, type CreateAssetInput } from '@cellar/shared';
import { TYPE_CONFIG, ASSET_TYPE_OPTIONS } from '@/lib/asset-types';
import { Alert, Button, FormField, Input, MultiSelect, Select, Textarea, cn } from '@cellar/ui';
import { MarkdownEditor } from './markdown-editor';
import { FileUploadField, type FileUploadValue } from './file-upload-field';
import { SnippetEditor } from '@/components/snippet-editor';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'shell', label: 'Shell' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

const isStorybook = typeof process !== 'undefined' && process.env.STORYBOOK === 'true';

export interface AssetFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateAssetInput & { collectionIds?: string[] }>;
  availableCollections: { id: string; name: string }[];
  onSubmit: (data: CreateAssetInput & { collectionIds?: string[] }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function AssetForm({
  mode,
  defaultValues,
  availableCollections,
  onSubmit,
  onCancel,
  submitLabel,
  onDirtyChange,
}: AssetFormProps) {
  const schema = mode === 'create' ? CreateAssetSchema : UpdateAssetSchema;
  type FormInput = CreateAssetInput & { collectionIds?: string[] };

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    clearErrors,
    control,
    setValue,
  } = useForm<FormInput>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      type: AssetType.SNIPPET,
      title: '',
      description: '',
      content: '',
      language: 'javascript',
      url: '',
      collectionIds: [],
      ...defaultValues,
    },
  });

  const [
    watchedType,
    title = '',
    description = '',
    content = '',
    language = 'javascript',
    url = '',
    filePath,
    fileName,
    mimeType,
    fileSize,
    collectionIds = [],
  ] = useWatch({
    control,
    name: [
      'type',
      'title',
      'description',
      'content',
      'language',
      'url',
      'filePath',
      'fileName',
      'mimeType',
      'fileSize',
      'collectionIds',
    ] as const,
  });
  const type = watchedType || AssetType.SNIPPET;

  const collectionOptions = useMemo(
    () => availableCollections.map(c => ({ value: c.id, label: c.name })),
    [availableCollections]
  );

  const fileValue: FileUploadValue | null = useMemo(() => {
    if (!filePath) return null;
    return {
      filePath,
      fileName: fileName || '',
      mimeType: mimeType || '',
      fileSize: fileSize || 0,
    };
  }, [filePath, fileName, mimeType, fileSize]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleFormSubmit = async (data: FormInput) => {
    try {
      clearErrors('root');
      await onSubmit(data);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const needsContent = type === 'SNIPPET' || type === 'PROMPT' || type === 'NOTE';
  const needsUrl = type === 'LINK';
  const needsFile = type === 'IMAGE' || type === 'FILE';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      {mode === 'create' && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ASSET_TYPE_OPTIONS.map(opt => {
              const config = TYPE_CONFIG[opt.value];
              const Icon = config.icon;
              const isActive = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue('type', opt.value);
                    if (opt.value === 'SNIPPET') {
                      setValue('language', 'javascript');
                    }
                    // Clear fields that don't apply to new type
                    setValue('url', '');
                    setValue('filePath', undefined);
                    setValue('fileName', undefined);
                    setValue('mimeType', undefined);
                    setValue('fileSize', undefined);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all border',
                    isActive
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Type
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-xs text-on-surface-variant opacity-60">
            {(() => {
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;
              return (
                <>
                  <Icon className="h-4 w-4" />
                  {config.label}
                </>
              );
            })()}
          </div>
        </div>
      )}

      <FormField label="Title" error={errors.title?.message}>
        <Input
          type="text"
          placeholder="Asset title"
          disabled={isSubmitting}
          error={errors.title?.message}
          value={title}
          onChange={val => setValue('title', val)}
          autoFocus
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          placeholder="Optional description"
          disabled={isSubmitting}
          error={errors.description?.message}
          value={description}
          onChange={val => setValue('description', val)}
          rows={3}
        />
      </FormField>

      {needsContent && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Content
          </label>
          {type === 'SNIPPET' ? (
            isStorybook ? (
              <div className="space-y-2">
                <Select
                  value={language}
                  options={LANGUAGE_OPTIONS}
                  onChange={val => setValue('language', val)}
                  disabled={isSubmitting}
                />
                <Textarea
                  value={content}
                  onChange={val => setValue('content', val)}
                  placeholder="Paste your code here..."
                  className="font-mono min-h-[240px]"
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="h-[300px]">
                <SnippetEditor
                  value={content}
                  onChange={val => setValue('content', val)}
                  language={language}
                  onLanguageChange={val => setValue('language', val)}
                  disabled={isSubmitting}
                />
              </div>
            )
          ) : (
            <MarkdownEditor
              value={content}
              onChange={val => setValue('content', val)}
              placeholder="Write your content here..."
            />
          )}
          {errors.content?.message && (
            <p className="text-xs text-error">{errors.content.message}</p>
          )}
        </div>
      )}

      {needsUrl && (
        <FormField label="URL" error={errors.url?.message}>
          <Input
            type="url"
            placeholder="https://example.com"
            disabled={isSubmitting}
            error={errors.url?.message}
            value={url}
            onChange={val => setValue('url', val)}
          />
        </FormField>
      )}

      {needsFile && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            File
          </label>
          <FileUploadField
            value={fileValue}
            onChange={data => {
              if (data) {
                setValue('filePath', data.filePath);
                setValue('fileName', data.fileName);
                setValue('mimeType', data.mimeType);
                setValue('fileSize', data.fileSize);
              } else {
                setValue('filePath', undefined);
                setValue('fileName', undefined);
                setValue('mimeType', undefined);
                setValue('fileSize', undefined);
              }
            }}
            accept={type === 'IMAGE' ? 'image/*' : undefined}
          />
          {errors.filePath?.message && (
            <p className="text-xs text-error">{errors.filePath.message}</p>
          )}
        </div>
      )}

      {availableCollections.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Collections
          </label>
          <MultiSelect
            options={collectionOptions}
            selected={collectionIds}
            onChange={val => setValue('collectionIds', val)}
            placeholder="Assign to collections..."
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {submitLabel || (mode === 'create' ? 'Create' : 'Save')}
        </Button>
      </div>
    </form>
  );
}
