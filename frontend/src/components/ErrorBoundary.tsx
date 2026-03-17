import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import i18n from "../i18n";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">{i18n.t("errorBoundary.title")}</h1>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => this.setState({ hasError: false })}
            >
              {i18n.t("errorBoundary.tryAgain")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
