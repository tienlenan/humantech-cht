"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Users, Heart, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface InsightsData {
  totalCovenants: number
  totalUpvotes: number
  recentCovenants: number
  narrative: string
}

export function CommunityInsights() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Failed to fetch insights:", err))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="grid w-full gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border/30 p-5"
          >
            <div className="h-8 w-16 rounded bg-muted" />
            <div className="mt-2 h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.totalCovenants === 0) return null

  const stats = [
    {
      icon: Users,
      value: data.totalCovenants,
      label: "Covenants Created",
    },
    {
      icon: Heart,
      value: data.totalUpvotes,
      label: "Community Upvotes",
    },
    {
      icon: TrendingUp,
      value: data.recentCovenants,
      label: "Last 30 Days",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-5xl flex-col gap-6"
    >
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, label }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="border-border/40 bg-card/60">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Narrative */}
      {data.narrative && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-primary/20 bg-card/60">
            <CardContent className="flex gap-3 py-5">
              <BarChart3 className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                  Community Pulse
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.narrative}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
