'use client'



interface SectionHeaderProps {
  label: string
  title: string
  subtitle?: string
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div
      
      
      className="text-center mb-16"
    >
      <span className="text-soul-purple font-semibold">{label}</span>
      <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">{title}</h1>
      {subtitle && (
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  )
}
