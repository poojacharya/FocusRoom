import { Settings as SettingsIcon } from 'lucide-react'
import { FeaturePlaceholder } from '../components/layout/FeaturePlaceholder'

export default function Settings() {
  return (
    <FeaturePlaceholder
      icon={SettingsIcon}
      title="Settings are coming soon"
      description="Account and preference settings land in a later phase — this page is wired up and ready."
    />
  )
}
