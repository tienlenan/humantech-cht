"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep
        const isUpcoming = i > currentStep

        return (
          <motion.div
            key={i}
            animate={{
              scale: isCurrent ? 1.4 : 1,
              opacity: isUpcoming ? 0.3 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "rounded-full transition-colors duration-300",
              isCurrent && "size-3 bg-primary glow",
              isCompleted && "size-2.5 bg-primary",
              isUpcoming && "size-2.5 bg-muted-foreground/30"
            )}
          />
        )
      })}
    </div>
  )
}
