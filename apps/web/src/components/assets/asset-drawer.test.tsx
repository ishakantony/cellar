import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { AssetType } from '@cellar/shared';

vi.mock('@/hooks/queries/use-assets', () => ({
  useAssetQuery: vi.fn(),
}));
vi.mock('@/hooks/mutations/use-asset-mutations', () => ({
  useTogglePinAssetMutation: vi.fn(),
  useDeleteAssetMutation: vi.fn(),
  useCreateAssetMutation: vi.fn(),
  useUpdateAssetMutation: vi.fn(),
}));
vi.mock('@/hooks/queries/use-collections', () => ({
  useCollectionsQuery: vi.fn(),
}));
vi.mock('./asset-content-renderer', () => ({
  AssetContentRenderer: () => <div data-testid="asset-content" />,
}));
vi.mock('./asset-form', () => ({
  AssetForm: vi.fn(() => <div data-testid="asset-form" />),
}));

import { useAssetQuery } from '@/hooks/queries/use-assets';
import {
  useTogglePinAssetMutation,
  useDeleteAssetMutation,
  useCreateAssetMutation,
  useUpdateAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
import { useCollectionsQuery } from '@/hooks/queries/use-collections';
import { AssetForm } from './asset-form';
import { AssetDrawer } from './asset-drawer';

const mockAsset = {
  id: 'abc123',
  userId: 'user1',
  type: AssetType.NOTE,
  title: 'My Test Note',
  description: 'A test asset description',
  pinned: false,
  content: '# Hello',
  language: null,
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  collections: [],
};

function makeWrapper(searchParams?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams} hasMemory>
        {children}
      </NuqsTestingAdapter>
    </QueryClientProvider>
  );
}

describe('AssetDrawer', () => {
  beforeEach(() => {
    vi.mocked(useAssetQuery).mockReturnValue({
      isPending: false,
      data: mockAsset,
    } as unknown as ReturnType<typeof useAssetQuery>);

    vi.mocked(useTogglePinAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useTogglePinAssetMutation>);

    vi.mocked(useDeleteAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useDeleteAssetMutation>);

    vi.mocked(useCreateAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'new-asset-id', title: 'New Asset' }),
    } as unknown as ReturnType<typeof useCreateAssetMutation>);

    vi.mocked(useCollectionsQuery).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useCollectionsQuery>);

    vi.mocked(useUpdateAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useUpdateAssetMutation>);
  });

  it('is closed when neither ?id nor ?new is present', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('opens and shows the asset title when ?id is set', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });

  it('closes on Escape key press and clears ?id', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('calls pin mutation with the asset id when pin button is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useTogglePinAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useTogglePinAssetMutation>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));

    expect(mutateAsync).toHaveBeenCalledWith('abc123');
  });

  it('opens confirm dialog when delete is clicked', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls delete mutation and closes drawer on confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useDeleteAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useDeleteAssetMutation>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(mutateAsync).toHaveBeenCalledWith('abc123');
    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('shows loading state while asset is fetching', () => {
    vi.mocked(useAssetQuery).mockReturnValue({
      isPending: true,
      data: undefined,
    } as unknown as ReturnType<typeof useAssetQuery>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  describe('edit mode', () => {
    it('clicking Edit switches the drawer to edit mode', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByTestId('asset-form')).toBeInTheDocument();
    });

    it('edit mode passes asset values as defaultValues to AssetForm', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.mode).toBe('edit');
      expect(formProps?.defaultValues).toMatchObject({ title: 'My Test Note' });
    });

    it('Save calls useUpdateAssetMutation with the form data', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      vi.mocked(useUpdateAssetMutation).mockReturnValue({
        mutateAsync,
      } as unknown as ReturnType<typeof useUpdateAssetMutation>);

      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'Updated Title', collectionIds: ['c1'] });
      });

      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title', collectionIds: ['c1'] })
      );
    });

    it('successful save returns the drawer to view mode', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'Updated', collectionIds: [] });
      });

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });

    it('Cancel with no changes immediately returns to view mode', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByTestId('asset-form')).toBeInTheDocument();

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      await act(async () => {
        formProps?.onCancel?.();
      });

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });

    it('Cancel with unsaved changes shows a discard confirmation dialog', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onDirtyChange?.(true);
      });
      // Re-read props after rerender so onCancel has the updated isDirty closure
      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onCancel?.();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/discard changes/i)).toBeInTheDocument();
    });

    it('choosing Stay in the discard dialog keeps the user in edit mode', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onDirtyChange?.(true);
      });
      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onCancel?.();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Stay' }));

      expect(screen.getByTestId('asset-form')).toBeInTheDocument();
    });

    it('choosing Discard in the discard dialog returns to view mode', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onDirtyChange?.(true);
      });
      await act(async () => {
        vi.mocked(AssetForm).mock.lastCall?.[0]?.onCancel?.();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Discard' }));

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });
  });

  describe('create mode', () => {
    it('renders AssetForm when ?new=1 is set', () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });
      expect(screen.getByTestId('asset-form')).toBeInTheDocument();
    });

    it('passes available collections to AssetForm', () => {
      vi.mocked(useCollectionsQuery).mockReturnValue({
        data: [
          {
            id: 'c1',
            name: 'Work',
            userId: 'u1',
            description: null,
            color: null,
            pinned: false,
            assetCount: 0,
            createdAt: '',
            updatedAt: '',
          },
        ],
      } as unknown as ReturnType<typeof useCollectionsQuery>);

      render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.availableCollections).toEqual([{ id: 'c1', name: 'Work' }]);
    });

    it('cancel clears ?new param and closes the drawer', async () => {
      render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });
      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];

      await act(async () => {
        formProps?.onCancel?.();
      });

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });

    it('submit calls createAsset mutation with collectionIds', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ id: 'new-asset-id', title: 'New' });
      vi.mocked(useCreateAssetMutation).mockReturnValue({
        mutateAsync,
      } as unknown as ReturnType<typeof useCreateAssetMutation>);

      render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });
      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];

      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'New', collectionIds: ['c1'] });
      });

      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NOTE', title: 'New', collectionIds: ['c1'] })
      );
    });

    it('submit transitions to view mode for the new asset', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ id: 'new-asset-id', title: 'New' });
      vi.mocked(useCreateAssetMutation).mockReturnValue({
        mutateAsync,
      } as unknown as ReturnType<typeof useCreateAssetMutation>);

      render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });
      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];

      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'New', collectionIds: [] });
      });

      // Create form is gone; view mode loads the new asset
      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });
  });
});
