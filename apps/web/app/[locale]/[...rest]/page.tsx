import Link from 'next/link'

/**
 * Catch-all for unmatched routes under [locale].
 * Renders 404 content directly instead of calling notFound()
 * to avoid Next.js 16 root layout error with next-intl.
 */
export default function CatchAllPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark px-4">
      <div className="text-center max-w-md">
        {/* 3-layer image */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 z-[1] flex items-center justify-center">
            <span className="text-8xl opacity-20">🧭</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/generated/error-404.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain z-[2]"
          />
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          Esta página no existe o fue movida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
