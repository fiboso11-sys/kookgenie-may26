"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { err: Error | null };

export class AiErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("AI UI error:", err, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            Something went wrong in the nutrition assistant. You can close this panel and try again.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
