import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#dc2626', fontSize: 20 }}>Aplikace spadla</h1>
          <pre style={{ background: '#fef2f2', padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 12 }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Znovu nacist
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
