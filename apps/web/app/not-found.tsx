import Link from 'next/link'
import './globals.css'

/**
 * Root-level not-found page. Handles routes that don't match any
 * [locale] path. Must include <html> and <body> since it renders
 * outside the locale layout.
 */
export default function RootNotFound() {
  return (
    <html lang="en" className="dark">
      <body style={{ backgroundColor: '#0F0F14', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            {/* 3-layer image */}
            <div style={{ position: 'relative', width: '16rem', height: '16rem', margin: '0 auto 2rem' }}>
              {/* z-1: Fallback */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <span style={{ fontSize: '5rem', opacity: 0.2 }}>🧭</span>
              </div>
              {/* z-2: AI image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/generated/error-404.png"
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 2 }}
              />
            </div>

            <h1 style={{ fontSize: '3.75rem', fontWeight: 700, marginBottom: '1rem' }}>404</h1>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2rem' }}>
              This page doesn&apos;t exist or has been moved.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#8B5CF6',
                borderRadius: '0.75rem',
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
