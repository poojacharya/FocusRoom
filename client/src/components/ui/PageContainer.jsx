export function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${className}`}>
      {children}
    </div>
  )
}
