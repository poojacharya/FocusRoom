import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileSidebarDrawer } from '../components/layout/MobileSidebarDrawer'
import { Navbar } from '../components/layout/Navbar'
import { useFocusTimerEngine } from '../hooks/useFocusTimerEngine'

// The application shell: static sidebar + mobile drawer + navbar + a
// scrollable content area rendered via <Outlet/>. Mounted once as the
// element for every protected, nested route in App.jsx — individual
// pages never re-render the shell around them.
export default function DashboardLayout() {
  // Keep the focus clock ticking (and able to auto-save) across routes.
  useFocusTimerEngine()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <MobileSidebarDrawer />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
