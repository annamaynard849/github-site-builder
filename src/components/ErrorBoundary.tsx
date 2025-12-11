import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Tasks section crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5 text-destructive">
          <p className="font-medium">Something went wrong in Tasks.</p>
          <p className="text-sm opacity-80">Please refresh or try again. If it persists, contact support.</p>
          {this.state.error?.message && (
            <p className="mt-2 text-xs opacity-70">Error: {this.state.error.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
