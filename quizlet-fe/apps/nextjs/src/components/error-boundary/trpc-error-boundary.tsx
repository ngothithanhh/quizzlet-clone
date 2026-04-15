"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TRPCErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[TRPCErrorBoundary] Caught error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[TRPCErrorBoundary] componentDidCatch:", error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      const errorMessage =
        this.state.error?.message || "An unexpected error occurred";

      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">
            Unable to load content
          </h3>
          <p className="mt-1 text-sm text-amber-700">{errorMessage}</p>
          <button
            onClick={this.reset}
            className="mt-3 rounded bg-amber-600 px-3 py-1 text-sm text-white hover:bg-amber-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

