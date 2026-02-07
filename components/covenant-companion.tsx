"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { motion } from "framer-motion"
import { Send, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageResponse } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"

interface CovenantCompanionProps {
  answers: string[]
  covenantText: string
  displayName: string
}

const companionTransport = new DefaultChatTransport({
  api: "/api/companion",
})

const STARTER_PROMPTS = [
  "How can I start honoring my covenant today?",
  "I'm struggling with setting screen time boundaries",
  "What practical exercises can strengthen my commitments?",
]

export function CovenantCompanion({
  answers,
  covenantText,
  displayName,
}: CovenantCompanionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage, status } = useChat({
    id: "companion",
    transport: companionTransport,
    onError: (err) => {
      console.error("Companion error:", err)
    },
  })

  const isLoading = status === "streaming" || status === "submitted"
  const extraBody = { answers, covenantText, displayName }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput("")
    await sendMessage({ text }, { body: extraBody })
  }

  const handleStarter = async (prompt: string) => {
    await sendMessage({ text: prompt }, { body: extraBody })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="size-4 text-primary" />
            Covenant Companion
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Ask for practical advice on living your covenant
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex max-h-[400px] min-h-[120px] flex-col gap-4 overflow-y-auto"
          >
            {messages.length === 0 && (
              <div className="flex flex-col gap-3 py-4">
                <p className="text-center text-xs text-muted-foreground">
                  Try asking something:
                </p>
                <div className="flex flex-col gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarter(prompt)}
                      disabled={isLoading}
                      className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <MessageResponse>
                        {msg.parts
                          ?.filter((p) => p.type === "text")
                          .map((p) => (p.type === "text" ? p.text : ""))
                          .join("") || ""}
                      </MessageResponse>
                    </div>
                  ) : (
                    <p>{msg.parts
                      ?.filter((p) => p.type === "text")
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("") || ""}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <Shimmer duration={1.5}>Thinking...</Shimmer>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your covenant..."
              className="text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
