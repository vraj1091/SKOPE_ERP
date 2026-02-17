/// <reference types="vite/client" />
import { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo)
        this.setState({
            error,
            errorInfo
        })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full">
                        {/* Error Card */}
                        <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-white text-center mb-4">
                                Oops! Something went wrong
                            </h1>

                            {/* Description */}
                            <p className="text-gray-400 text-center mb-6">
                                The application encountered an unexpected error. Don't worry, your data is safe.
                            </p>

                            {/* Error Details (Development) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mb-6 p-4 rounded-xl bg-black/30 border border-red-500/20">
                                    <p className="text-red-400 font-mono text-sm mb-2">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="text-gray-400 cursor-pointer hover:text-white">
                                                Stack Trace
                                            </summary>
                                            <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={this.handleReset}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Reload Page
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </div>

                            {/* Help Text */}
                            <p className="text-gray-500 text-sm text-center mt-6">
                                If this problem persists, please contact support or check the browser console for more details.
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-2">💡 Quick Fixes:</h3>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>• Try refreshing the page (Ctrl+R or Cmd+R)</li>
                                <li>• Clear your browser cache (Ctrl+Shift+Delete)</li>
                                <li>• Try opening in incognito/private mode</li>
                                <li>• Check your internet connection</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
