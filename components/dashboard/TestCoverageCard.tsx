"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TestCoverageCardProps {
  title: string
  coverage: number
  threshold: number
  status: "pass" | "fail" | "pending"
}

const statusColors: Record<string, string> = {
  pass: "text-green-600 dark:text-green-400",
  fail: "text-destructive",
  pending: "text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  pass: "Passing",
  fail: "Failing",
  pending: "Pending",
}

/**
 * TestCoverageCard — dashboard component showing test coverage status.
 * Issue #19: Enables at-a-glance view of CI test coverage metrics.
 */
export function TestCoverageCard({
  title,
  coverage,
  threshold,
  status,
}: TestCoverageCardProps) {
  const pct = Math.min(Math.round(coverage), 100)

  return (
    <Card className="p-4" data-testid={`coverage-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            status === "pass"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : status === "fail"
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-muted-foreground",
          )}
          data-testid={`coverage-status-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">{pct}%</span>
          <span className="text-xs text-muted-foreground">Threshold: {threshold}%</span>
        </div>
        <Progress
          value={pct}
          className={cn(
            "mt-2 h-2",
            status === "pass"
              ? "[&>div]:bg-green-500"
              : status === "fail"
                ? "[&>div]:bg-destructive"
                : "",
          )}
          aria-label={`${title} coverage at ${pct}%`}
        />
      </div>

      {status === "fail" && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          Coverage below the {threshold}% threshold. Please add more tests.
        </p>
      )}
    </Card>
  )
}
