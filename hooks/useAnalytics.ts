"use client"

import { useCallback, useState } from "react"
import { postMergeAnalytics, buildMergePayload } from "@/lib/services/analytics.service"
import type { MergeAnalyticsPayloadV2, CIWorkflowStep } from "@/lib/types"

interface UseAnalyticsReturn {
  posting: boolean
  lastResult: boolean | null
  postMerge: (params: {
    repository: string
    branch: string
    commit: string
    author: string
    issue: number
    issues?: number[]
    coverageVerified?: boolean
    fixtureCoverageVerified?: boolean
    accessibilityVerified?: boolean
    testResults?: { total: number; passed: number; failed: number }
    status?: "success" | "failure"
  }) => Promise<boolean>
  buildSummary: (steps: CIWorkflowStep[]) => string
}

/**
 * useAnalytics — hook for posting merge analytics and formatting workflow summaries.
 * Issue #19: Provides a client-side interface for CI/CD analytics tracking.
 *
 * Security: No secrets or private keys are handled. The URL is obtained from
 * environment variables or passed explicitly.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [posting, setPosting] = useState(false)
  const [lastResult, setLastResult] = useState<boolean | null>(null)

  const postMerge = useCallback(
    async (params: {
      repository: string
      branch: string
      commit: string
      author: string
      issue: number
      issues?: number[]
      coverageVerified?: boolean
      fixtureCoverageVerified?: boolean
      accessibilityVerified?: boolean
      testResults?: { total: number; passed: number; failed: number }
      status?: "success" | "failure"
    }): Promise<boolean> => {
      setPosting(true)
      try {
        const payload: MergeAnalyticsPayloadV2 = buildMergePayload(params)
        const result = await postMergeAnalytics(payload)
        setLastResult(result)
        return result
      } catch {
        setLastResult(false)
        return false
      } finally {
        setPosting(false)
      }
    },
    [],
  )

  const buildSummary = useCallback((steps: CIWorkflowStep[]): string => {
    const total = steps.length
    const passed = steps.filter((s) => s.status === "success").length
    const failed = steps.filter((s) => s.status === "failure").length
    const totalDuration = steps.reduce((sum, s) => sum + s.durationMs, 0)

    return [
      `Workflow completed: ${passed}/${total} steps passed, ${failed} failed`,
      `Total duration: ${(totalDuration / 1000).toFixed(2)}s`,
      ...steps.map(
        (s) => `  [${s.status.toUpperCase()}] ${s.name} (${s.durationMs}ms)`,
      ),
    ].join("\n")
  }, [])

  return {
    posting,
    lastResult,
    postMerge,
    buildSummary,
  }
}
