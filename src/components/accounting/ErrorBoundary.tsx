import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Props , State} from "../../../types/error.types"

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 min-h-[400px] space-y-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-bounce">
            <AlertCircle size={32} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Something went wrong</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              We encountered an error while loading this component. Please try refreshing the section.
            </p>
          </div>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 hover:text-slate-200"
          >
            <RefreshCw size={16} /> Try Again
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-left max-w-2xl overflow-auto">
              <p className="text-xs font-mono text-red-600 font-bold">{this.state.error?.message}</p>
              <pre className="text-[10px] font-mono text-gray-600 mt-2 bg-white p-2 rounded border">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.children;
  }

  private get children() {
    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
