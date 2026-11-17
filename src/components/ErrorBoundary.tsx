import { Component, ErrorInfo, ReactNode } from "react";
import { Lock } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Ocurrió un error inesperado.",
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="pt-16 min-h-screen section-grid flex items-center justify-center px-4">
          <div className="card-tech p-8 max-w-md w-full border border-red-500/30 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto mb-4">
              <Lock className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="font-orbitron font-black text-lg text-white mb-2">
              Error de Acceso o Conexión
            </h2>
            <p className="text-white/60 text-xs mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="btn-neon px-6 py-2.5 text-xs"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
