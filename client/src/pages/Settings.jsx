import { useEffect, useState } from 'react'
import { MoonStar, Upload } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { DEFAULT_SETTINGS, getStoredSettings, persistSettings } from '../lib/settings'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { Avatar } from '../components/ui/Avatar'
import { updateCurrentUserProfile } from '../lib/api/auth.api'

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const user = useAuthStore((s) => s.user)
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')

  useEffect(() => {
    setAvatarUrl(user?.avatar || '')
  }, [user?.avatar])

  useEffect(() => {
    setSettings(getStoredSettings())
  }, [])

  useEffect(() => {
    persistSettings(settings)
  }, [settings])

  const updateNumber = (key, value) => {
    const asNumber = Number(value)
    setSettings((current) => ({
      ...current,
      [key]: Number.isFinite(asNumber) ? asNumber : 0,
    }))
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const nextAvatar = typeof reader.result === 'string' ? reader.result : ''
      setAvatarUrl(nextAvatar)
      updateUserProfile({ avatar: nextAvatar })
      updateCurrentUserProfile({ avatar: nextAvatar }).catch(() => {})
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const applyAvatarUrl = async () => {
    if (!avatarUrl.trim()) {
      updateUserProfile({ avatar: null })
      setAvatarUrl('')
      try {
        await updateCurrentUserProfile({ avatar: null })
      } catch {
        // keep local state even if the API is unavailable
      }
      return
    }

    const nextAvatar = avatarUrl.trim()
    updateUserProfile({ avatar: nextAvatar })
    try {
      await updateCurrentUserProfile({ avatar: nextAvatar })
    } catch {
      // keep local state even if the API is unavailable
    }
  }

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
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Focus defaults</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Focus session length (minutes)"
                  type="number"
                  min={15}
                  step={5}
                  value={settings.focusSessionMinutes}
                  onChange={(event) => updateNumber('focusSessionMinutes', event.target.value)}
                />
                <Input
                  label="Default planner hours/day"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={settings.plannerDefaultHours}
                  onChange={(event) => updateNumber('plannerDefaultHours', event.target.value)}
                />
              </div>
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

              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>

            <Button type="button" variant="secondary" onClick={resetToDefaults}>
              Reset to defaults
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
