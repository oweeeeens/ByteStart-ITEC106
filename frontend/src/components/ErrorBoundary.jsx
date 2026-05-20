import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ByteStart error:', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '420px',
            textAlign: 'center',
            background: '#fff',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>😵</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              ByteStart ran into an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#00ADB5',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
