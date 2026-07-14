import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-20">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">Something went wrong</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">We hit an unexpected issue.</h1>
            <p className="mt-3 text-slate-600">Please refresh the page or return home. If the issue continues, contact us for support.</p>
            <a href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white">Go home</a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
