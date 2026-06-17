"use client"

import { ArrowUpRight, TrendingUp, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useBalances } from "@/hooks/useBalances"
import { useWallets } from "@/hooks/useFinanceServices"

export function StatsCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const { totalFiatValue, totalCryptoValue, loading, wallets, assets } = useBalances()
  const { formatMoney } = useWallets()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const dynamicStats = [
    {
      title: "Total Balance (USD)",
      value: formatMoney(totalFiatValue + totalCryptoValue, "USD"),
      increase: "+2.4% from last week",
      bgColor: "bg-primary",
      textColor: "text-primary-foreground",
      delay: "0ms",
    },
    {
      title: "Fiat Wallets",
      value: wallets.length.toString(),
      increase: `${wallets[0]?.code} Active`,
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "100ms",
    },
    {
      title: "Crypto Assets",
      value: assets.length.toString(),
      increase: `${assets[0]?.code} Lead`,
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "200ms",
    },
    {
      title: "Active Stake",
      value: "8.5%",
      subtitle: "APY Average",
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "300ms",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {dynamicStats.map((stat, index) => (
        <Card
          key={stat.title}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{ animationDelay: stat.delay }}
          className={`${stat.bgColor} ${stat.textColor} p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
        >
          {/* ... existing card content ... */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
            <div
              className={`w-6 h-6 rounded-full ${stat.bgColor === "bg-primary" ? "bg-primary-foreground/20" : "bg-primary"
                } flex items-center justify-center transition-transform duration-300 ${hoveredCard === index ? "rotate-45" : ""
                }`}
            >
              <ArrowUpRight
                className={`w-3 h-3 ${stat.bgColor === "bg-primary" ? "text-primary-foreground" : "text-primary-foreground"}`}
              />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{stat.value}</p>
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            {stat.increase && (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>{stat.increase}</span>
              </>
            )}
            {stat.subtitle && <span>{stat.subtitle}</span>}
          </div>
        </Card>
      ))}
    </div>
  )
}
