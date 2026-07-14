import { motion } from 'framer-motion'

export function AuthCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-xl shadow-gray-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none"
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              {title}
            </h1>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  )
}
