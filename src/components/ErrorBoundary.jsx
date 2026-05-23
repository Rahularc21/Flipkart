import React, { Component } from 'react';

/**
 * Catches visual runtime render crashes, logs them, and displays a clean error viewport without breaking the application instance.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a runtime exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow-sm max-w-lg mx-auto my-12" id="error-boundary-view">
          <div className="text-4xl">⚠️</div>
          <h2 className="mt-4 text-xl font-semibold text-[#212121]">Something went wrong.</h2>
          <p className="mt-2 text-sm text-[#878787] leading-relaxed">
            We are unable to present this specific component right now. Try reloading the viewport or navigate back to the principal page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 rounded px-6 py-2.5 bg-[#2874F0] text-white font-medium text-sm hover:shadow-md transition active:translate-y-[1px]"
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
