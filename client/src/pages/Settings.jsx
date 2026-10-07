import { useEffect, useState } from 'react'
import { MoonStar, Upload } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useSettingsStore } from '../store/useSettingsStore'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { Avatar } from '../components/ui/Avatar'
import { updateCurrentUserProfile } from '../lib/api/auth.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'
import { queryClient } from '../lib/queryClient'

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? 'border-brand-500 bg-brand-500'
            : 'border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-white/10'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const settings = useSettingsStore((s) => s.settings)
  const updateSetting = useSettingsStore((s) => s.updateSetting)
  const resetSettings = useSettingsStore((s) => s.resetSettings)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const user = useAuthStore((s) => s.user)
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')

  useEffect(() => {
    setAvatarUrl(user?.avatar || '')
  }, [user?.avatar])

  const resetToDefaults = () => {
    resetSettings()
    setTheme('dark')
  }

  const saveAvatar = async (avatar) => {
    try {
      const { user: updatedUser } = await updateCurrentUserProfile({ avatar })
      updateUserProfile(updatedUser)
      setAvatarUrl(avatar || '')
      await queryClient.invalidateQueries({ queryKey: ['friends'] })
      await queryClient.invalidateQueries({ queryKey: ['friends', 'search'] })
      showSuccessToast('Profile photo updated')
    } catch {
      showErrorToast("Couldn't update your profile photo")
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
      showErrorToast('Choose a PNG, JPEG, GIF, or WebP image for your profile photo')
      event.target.value = ''
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      showErrorToast('Profile photos must be 4 MB or smaller')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextAvatar = typeof reader.result === 'string' ? reader.result : ''
      if (!nextAvatar) {
        showErrorToast("Couldn't read that image")
        return
      }
      saveAvatar(nextAvatar)
    }
    reader.onerror = () => showErrorToast("Couldn't read that image")
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const applyAvatarUrl = () => saveAvatar(avatarUrl.trim() || null)

  return (
    <PageContainer>
      <SectionHeader
        title="Settings"
        subtitle="Tune your workspace so it feels like your own study flow"
      />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionHeader title="Profile" subtitle="Personalize your account" />
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10">
              <Avatar name={user?.name} src={user?.avatar} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900 dark:text-gray-50">{user?.name || 'Your profile'}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Profile photo</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10">
                  <Upload className="h-4 w-4" />
                  Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <div className="flex-1">
                  <Input
                    label="Image URL"
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                  />
                </div>
              </div>
              <Button type="button" variant="secondary" fullWidth={false} onClick={applyAvatarUrl}>
                Save photo
              </Button>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Appearance" subtitle="Visual preferences" />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <MoonStar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-label="Dark mode"
                aria-checked={theme === 'dark'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                  theme === 'dark' ? 'border-brand-500 bg-brand-500' : 'border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Button type="button" variant="secondary" onClick={resetToDefaults}>
              Reset to defaults
            </Button>

            <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-white/10">
              <PreferenceToggle
                label="Daily recap"
                description="Show today's completed tasks and focus time on the dashboard"
                checked={settings.dailyRecap}
                onChange={(value) => updateSetting('dailyRecap', value)}
              />
              <PreferenceToggle
                label="Task reminders"
                description="Show overdue and due-today tasks in notifications"
                checked={settings.taskReminders}
                onChange={(value) => updateSetting('taskReminders', value)}
              />
              <PreferenceToggle
                label="Auto-start focus"
                description="Start the timer automatically when you open Focus"
                checked={settings.autoStartFocus}
                onChange={(value) => updateSetting('autoStartFocus', value)}
              />
              <PreferenceToggle
                label="Compact planner"
                description="Use a denser layout in the AI Study Planner"
                checked={settings.compactPlanner}
                onChange={(value) => updateSetting('compactPlanner', value)}
              />
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
