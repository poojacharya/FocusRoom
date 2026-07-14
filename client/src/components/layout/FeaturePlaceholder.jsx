import { PageContainer } from '../ui/PageContainer'
import { EmptyState } from '../ui/EmptyState'

/**
 * Shared shell for every not-yet-built feature page (Tasks, Notes, Study
 * Rooms, Chat, Friends, Analytics, Settings). Keeps each page file a thin,
 * declarative wrapper instead of duplicating this layout seven times.
 */
export function FeaturePlaceholder({ icon, title, description }) {
  return (
    <PageContainer>
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState icon={icon} title={title} description={description} />
      </div>
    </PageContainer>
  )
}
