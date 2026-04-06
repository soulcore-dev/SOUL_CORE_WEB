'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soul-dark px-4">
      <div className="text-center max-w-md">
        {/* 3-layer image */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* z-1: Fallback */}
          <div className="absolute inset-0 z-[1] flex items-center justify-center">
            <span className="text-8xl opacity-20">🤖</span>
          </div>
          {/* z-2: AI image */}
          <img
            src="/generated/error-500.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain z-[2]"
            onError={(e: any) => { e.target.style.display = 'none' }}
          />
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <p className="text-xl text-gray-400 mb-8">
          Something went wrong. We&apos;re on it.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex items-center px-6 py-3 bg-soul-purple hover:bg-soul-purple-dark rounded-xl font-semibold text-white transition-all duration-200 glow-hover"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
