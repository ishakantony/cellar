import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface FeatureErrorBoundaryProps {
  children: ReactNode;
  /** Identifier of the failed feature; surfaced in the error card. */
  featureId?: string;
  /** Called when the user clicks "Retry"; the parent should reset+reload. */
  onRetry?: () => void;
}

interface FeatureErrorBoundaryState {
  error: Error | null;
}

/**
 * Per-feature error boundary owned by the shell. Wraps every feature's route
 * subtree so a crash inside one feature can't take down the whole app —
 * instead we render an inline error card with a retry button.
 */
export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  state: FeatureErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(`[shell] feature ${this.props.featureId ?? 'unknown'} crashed`, error, info);
    }
  }

  handleRetry = (): void => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="m-6 rounded-md border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200"
        >
          <p className="font-semibold">
            Something went wrong loading {this.props.featureId ?? 'this section'}.
          </p>
          <p className="mt-1 opacity-80">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-3 rounded border border-red-500/40 px-3 py-1 hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
