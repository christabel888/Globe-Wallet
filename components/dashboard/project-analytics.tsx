"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { ChartDailyDataPoint, ActivityTooltipProps } from "@/lib/types"

const chartData: ChartDailyDataPoint[] = [
  { day: "S", value: 45, label: "Sunday" },
  { day: "M", value: 75, label: "Monday" },
  { day: "T", value: 74, label: "Tuesday" },
  { day: "W", value: 92, label: "Wednesday" },
  { day: "T", value: 35, label: "Thursday" },
  { day: "F", value: 60, label: "Friday" },
  { day: "S", value: 50, label: "Saturday" },
]

const barColors: string[] = ["#059669", "#047857", "#10b981", "#065f46", "#059669", "#047857", "#10b981"]
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"
import type { ChartDataPoint, ChartTooltipRenderProps, ActivityTooltipProps } from "@/lib/types"

const ProjectAnalyticsChart = dynamic(
  () => import("./project-analytics-chart"),
  { ssr: false, loading: () => <div className="h-64 mb-4 flex items-center justify-center">Loading chart...</div> }
)

interface ProjectAnalyticsEntry extends ChartDataPoint {
  day: string
}

const chartData: ProjectAnalyticsEntry[] = [
  { day: "S", label: "Sunday",    value: 45 },
  { day: "M", label: "Monday",    value: 75 },
  { day: "T", label: "Tuesday",   value: 74 },
  { day: "W", label: "Wednesday", value: 92 },
  { day: "T", label: "Thursday",  value: 35 },
  { day: "F", label: "Friday",    value: 60 },
  { day: "S", label: "Saturday",  value: 50 },
]

const chartConfig: ChartConfig = {
  value: {
    label: "Activity",
    color: "#059669",
  },
}

function CustomTooltip({ active, payload }: ChartTooltipRenderProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
      <p className="font-bold">{entry.value}%</p>
      <p className="text-[10px] opacity-80">{entry.payload.label}</p>
    </div>
  )
}

export function ProjectAnalytics() {
  const maxValue = Math.max(...chartData.map((d) => d.value))
  const average = Math.round(chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length)

  return (
    <Card
      data-testid="project-analytics"
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up bg-linear-to-br from-background to-muted/20"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Project Analytics</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
          <span>Weekly Activity</span>
        </div>
      </div>

      <ProjectAnalyticsChart chartData={chartData} />

      <div className="pt-4 border-t border-muted/50 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Average: </span>
          <span className="font-semibold text-foreground">{average}%</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Peak: </span>
          <span className="font-semibold text-emerald-600">{maxValue}%</span>
        </div>
      </div>
    </Card>
  )
}
