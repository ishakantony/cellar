import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssetType } from '@cellar/shared';
import { useAssetDrawer } from '@/hooks/use-asset-drawer';

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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('AssetDrawer', () => {
  beforeEach(() => {
    // Reset zustand store before each test
    useAssetDrawer.setState({
      isOpen: false,
      mode: null,
      assetId: null,
      initialType: null,
      initialCollectionId: null,
    });

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

  afterEach(() => {
    useAssetDrawer.setState({
      isOpen: false,
      mode: null,
      assetId: null,
      initialType: null,
      initialCollectionId: null,
    });
  });

  it('is closed when the store is in initial state', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('opens and shows the asset title when openView is called', () => {
    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });

  it('closes on Escape key press', async () => {
    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('calls pin mutation with the asset id when pin button is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useTogglePinAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useTogglePinAssetMutation>);

    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));

    expect(mutateAsync).toHaveBeenCalledWith('abc123');
  });

  it('opens confirm dialog when delete is clicked', async () => {
    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls delete mutation and closes drawer on confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useDeleteAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useDeleteAssetMutation>);

    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });

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

    useAssetDrawer.setState({
      isOpen: true,
      mode: 'view',
      assetId: 'abc123',
      initialType: null,
      initialCollectionId: null,
    });
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  describe('edit mode', () => {
    it('clicking Edit switches the drawer to edit mode', async () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByTestId('asset-form')).toBeInTheDocument();
    });

    it('edit mode passes asset values as defaultValues to AssetForm', async () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.mode).toBe('edit');
      expect(formProps?.defaultValues).toMatchObject({ title: 'My Test Note' });
    });

    it('openEdit mode opens the drawer directly in edit mode', () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'edit',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      expect(screen.getByTestId('asset-form')).toBeInTheDocument();
    });

    it('Save calls useUpdateAssetMutation with the form data', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      vi.mocked(useUpdateAssetMutation).mockReturnValue({
        mutateAsync,
      } as unknown as ReturnType<typeof useUpdateAssetMutation>);

      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'Updated', collectionIds: [] });
      });

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });

    it('Cancel with no changes immediately returns to view mode', async () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByTestId('asset-form')).toBeInTheDocument();

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      await act(async () => {
        formProps?.onCancel?.();
      });

      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });

    it('Cancel with unsaved changes shows a discard confirmation dialog', async () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'view',
        assetId: 'abc123',
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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
    it('renders AssetForm when mode is create', () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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

      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.availableCollections).toEqual([{ id: 'c1', name: 'Work' }]);
    });

    it('passes initialType as defaultValues.type to AssetForm', () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: 'SNIPPET',
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.defaultValues).toMatchObject({ type: 'SNIPPET' });
    });

    it('passes initialCollectionId as defaultValues.collectionIds to AssetForm', () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: 'col-42',
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });

      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];
      expect(formProps?.defaultValues).toMatchObject({ collectionIds: ['col-42'] });
    });

    it('cancel closes the drawer', async () => {
      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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

      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
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

      useAssetDrawer.setState({
        isOpen: true,
        mode: 'create',
        assetId: null,
        initialType: null,
        initialCollectionId: null,
      });
      render(<AssetDrawer />, { wrapper: makeWrapper() });
      const formProps = vi.mocked(AssetForm).mock.lastCall?.[0];

      await act(async () => {
        await formProps?.onSubmit({ type: 'NOTE', title: 'New', collectionIds: [] });
      });

      // Create form is gone; view mode loads the new asset
      expect(screen.queryByTestId('asset-form')).not.toBeInTheDocument();
    });
  });
});
