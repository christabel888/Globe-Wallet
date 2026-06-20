import { cn } from '@/lib/utils'

type Status = 'completed' | 'pending' | 'failed'

const STATUS_STYLES: Record<Status, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS: Record<Status, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
}

interface TransactionStatusBadgeProps {
  status: Status
  className?: string
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  return (
    <span
      role="status"
      data-testid="transaction-status-badge"
      data-status={status}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STATUS_STYLES[status] ?? STATUS_STYLES.failed,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
