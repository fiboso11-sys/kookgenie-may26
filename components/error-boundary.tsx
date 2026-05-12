"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; title?: string };

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error.message, info.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-900 shadow-sm">
          <p className="font-semibold">{this.props.title ?? "Something went wrong"}</p>
          <p className="mt-2 text-red-800/90">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-4 min-h-11 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
