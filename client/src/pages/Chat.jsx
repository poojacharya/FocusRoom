import { MessageSquare } from 'lucide-react'
import { FeaturePlaceholder } from '../components/layout/FeaturePlaceholder'

export default function Chat() {
  return (
    <FeaturePlaceholder
      icon={MessageSquare}
      title="Chat is coming soon"
      description="Real-time chat lands in a later phase — this page is wired up and ready."
    />
  )
}
