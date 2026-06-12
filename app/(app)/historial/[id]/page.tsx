import { notFound } from 'next/navigation'
import { getCostingById } from '@/lib/costings'
import { CosteoDetailScreen } from './CosteoDetailScreen'

export default async function CosteoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const costing = await getCostingById(id)
  if (!costing) notFound()

  return <CosteoDetailScreen costing={costing} />
}
