import { NotebookText } from 'lucide-react'
import { FeaturePlaceholder } from '../components/layout/FeaturePlaceholder'

export default function Notes() {
  return (
    <FeaturePlaceholder
      icon={NotebookText}
      title="Notes are coming soon"
      description="The notes editor lands in a later phase — this page is wired up and ready."
    />
  )
}
