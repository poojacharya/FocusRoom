import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../../store/useUIStore'
import { Sidebar } from './Sidebar'

export function MobileSidebarDrawer() {
  const isOpen = useUIStore((s) => s.isMobileSidebarOpen)
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden"
          >
            {/* Always fully expanded with no collapse control — collapsing
                a full-width drawer buys nothing, and it must not react to
                the desktop sidebar's collapsed state in useUIStore. */}
            <Sidebar collapsed={false} showCollapseToggle={false} onNavigate={closeMobileSidebar} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
