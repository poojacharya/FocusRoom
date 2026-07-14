import {
  LayoutDashboard,
  CheckSquare,
  NotebookText,
  UsersRound,
  Users2,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react'

// Single source of truth for primary navigation — shared by the desktop
// sidebar and the mobile drawer so the two never drift out of sync.
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Notes', path: '/notes', icon: NotebookText },
  { label: 'Study Rooms', path: '/study-room', icon: UsersRound },
  { label: 'Friends', path: '/friends', icon: Users2 },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
]
