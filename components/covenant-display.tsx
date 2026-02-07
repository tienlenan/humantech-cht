"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MessageResponse } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning"
import type { UIMessage } from "ai"

interface CovenantDisplayProps {
  message: UIMessage | undefined
  isStreaming: boolean
  answers: string[]
}

export function CovenantDisplay({
  message,
  isStreaming,
}: CovenantDisplayProps) {
  const reasoningParts = message?.parts?.filter((p) => p.type === "reasoning") ?? []
  const textParts = message?.parts?.filter((p) => p.type === "text") ?? []

  const reasoningText = reasoningParts
    .map((p) => (p.type === "reasoning" ? p.text : ""))
    .join("\n")
  const covenantText = textParts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")

  const hasReasoning = reasoningText.length > 0
  const hasText = covenantText.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-primary/20 bg-card/90 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-4">
          {/* Reasoning section */}
          {(hasReasoning || (isStreaming && !hasText)) && (
            <Reasoning
              isStreaming={isStreaming && !hasText}
              defaultOpen={true}
            >
              <ReasoningTrigger
                getThinkingMessage={(streaming, duration) => {
                  if (streaming || duration === 0) {
                    return (
                      <Shimmer duration={1}>
                        Reflecting on your answers...
                      </Shimmer>
                    )
                  }
                  if (duration === undefined) {
                    return <p>Reflected for a few seconds</p>
                  }
                  return <p>Reflected for {duration} seconds</p>
                }}
              />
              <ReasoningContent>{reasoningText}</ReasoningContent>
            </Reasoning>
          )}

          {/* Loading state before any content */}
          {isStreaming && !hasReasoning && !hasText && (
            <div className="flex items-center gap-3 py-4">
              <Shimmer duration={2}>Crafting your covenant...</Shimmer>
            </div>
          )}

          {/* Covenant text */}
          {hasText && (
            <div className="prose prose-invert max-w-none">
              <MessageResponse>{covenantText}</MessageResponse>
              {isStreaming && (
                <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-primary" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
