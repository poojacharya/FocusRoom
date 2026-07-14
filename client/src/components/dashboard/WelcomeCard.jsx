import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { Card } from '../ui/Card'

export function WelcomeCard() {
  const user = useAuthStore((s) => s.user)
  const firstName = (user?.name || 'there').split(' ')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white" padding="lg">
        <p className="text-sm font-medium text-white/80">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{firstName}</h1>
        <p className="mt-3 max-w-md text-sm text-white/80">
          Here&apos;s a look at your day — tasks, notes, and study sessions, all in one place.
        </p>
      </Card>
    </motion.div>
  )
}
