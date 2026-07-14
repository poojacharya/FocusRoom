import { motion } from 'framer-motion'
import { Logo } from '../ui/Logo'

const blobTransition = (delay) => ({
  duration: 8,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: 'easeInOut',
  delay,
})

export function AuthLayout({ children, tagline = 'A calmer way to get things done.' }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      {/* Branding panel — hidden below lg, where the layout collapses to
          a single column. */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <motion.div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={blobTransition(0)}
        />
        <motion.div
          className="absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-brand-300/20 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
          transition={blobTransition(1.5)}
        />
        <motion.div
          className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={blobTransition(3)}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-2 text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 font-semibold backdrop-blur-sm">
            F
          </div>
          <span className="text-lg font-semibold tracking-tight">FocusHub AI</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 max-w-sm"
        >
          <p className="text-2xl font-medium leading-snug text-white">{tagline}</p>
          <p className="mt-3 text-sm text-white/70">
            Notes, tasks, scheduling, and AI study tools — all in one calm, focused workspace.
          </p>
        </motion.div>
      </div>

      {/* Auth content */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
