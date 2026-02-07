"use client"

import { useState, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { HeroSection } from "@/components/hero-section"
import { Questionnaire } from "@/components/questionnaire"
import { CovenantDisplay } from "@/components/covenant-display"
import { CopyShareActions } from "@/components/copy-share-actions"
import { CommunityGallery } from "@/components/community-gallery"
import { CovenantCompanion } from "@/components/covenant-companion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Eye, Heart, Shield, Zap, Globe, ArrowLeft, User, Lightbulb, Home as HomeIcon, ExternalLink } from "lucide-react"

type AppStep = "landing" | "questions" | "name-input" | "result" | "gallery"

const QUESTION_LABELS = [
  { label: "Identity", icon: User },
  { label: "Catalyst", icon: Lightbulb },
  { label: "Awareness", icon: Eye },
  { label: "Values", icon: Heart },
  { label: "Boundaries", icon: Shield },
  { label: "Agency", icon: Zap },
  { label: "Legacy", icon: Globe },
]

// Create transport outside of component to prevent re-creation on re-renders
const covenantTransport = new DefaultChatTransport({
  api: "/api/generate-covenant",
})

export default function Home() {
  const [step, setStep] = useState<AppStep>("landing")
  const [answers, setAnswers] = useState<string[]>([])
  const [displayName, setDisplayName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [savedToGallery, setSavedToGallery] = useState(false)

  const { messages, sendMessage, status, error } = useChat({
    id: "covenant",
    transport: covenantTransport,
    onError: (err) => {
      console.error("Chat error:", err)
    },
  })

  // Get the last assistant message (the generated covenant)
  const assistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages]
  )

  // Extract the covenant text from text parts for copy/share
  const covenantText = useMemo(() => {
    if (!assistantMessage?.parts) return ""
    return assistantMessage.parts
      .filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
  }, [assistantMessage])

  const handleQuestionsComplete = (answersData: string[]) => {
    setAnswers(answersData)
    setStep("name-input")
  }

  const handleGenerate = async () => {
    setStep("result")
    await sendMessage(
      { text: "generate" },
      { body: { answers, displayName: displayName.trim() || "Anonymous" } }
    )
  }

  const handleSaveToGallery = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsSaving(false)
    setSavedToGallery(true)
  }

  const handleStartOver = () => {
    setStep("landing")
    setAnswers([])
    setDisplayName("")
    setSavedToGallery(false)
  }

  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <AnimatePresence mode="wait">
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <HeroSection
              onStart={() => setStep("questions")}
              onViewGallery={() => setStep("gallery")}
            />
          </motion.div>
        )}

        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex w-full items-center justify-center px-4 py-12"
          >
            <Questionnaire
              onComplete={handleQuestionsComplete}
              onBack={() => setStep("landing")}
            />
          </motion.div>
        )}

        {step === "name-input" && (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center justify-center px-4 py-12"
          >
            <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-xl font-semibold text-foreground">
                    Your Reflections
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Here&apos;s a summary of what you shared
                  </p>
                </div>

                {/* Answers Summary */}
                <div className="flex flex-col gap-3">
                  {answers.map((answer, i) => {
                    const { label, icon: Icon } = QUESTION_LABELS[i]
                    return (
                      <div
                        key={label}
                        className="flex gap-3 rounded-lg border border-border/30 bg-muted/30 p-3"
                      >
                        <div className="flex shrink-0 items-start gap-2">
                          <Icon className="mt-0.5 size-4 text-primary" />
                          <Badge variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {answer}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-col gap-3 border-t border-border/30 pt-4">
                  <p className="text-center text-sm text-muted-foreground">
                    What name would you like displayed with your covenant?
                  </p>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Anonymous"
                    className="text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerate()
                    }}
                  />
                </div>

                <Button onClick={handleGenerate} className="gap-2">
                  <Sparkles className="size-4" />
                  Generate My Covenant
                </Button>

                <button
                  onClick={() => setStep("questions")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Go back to questions
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex w-full justify-center px-4 py-12"
          >
            <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-[360px_1fr]">
              {/* Left column — Summary */}
              <div className="flex flex-col gap-4">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {(displayName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {displayName || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your Reflections
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {answers.map((answer, i) => {
                        const { label, icon: Icon } = QUESTION_LABELS[i]
                        return (
                          <div
                            key={label}
                            className="flex flex-col gap-1.5 rounded-md border border-border/30 bg-muted/20 p-2.5"
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon className="size-3.5 text-primary" />
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {label}
                              </Badge>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {answer}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Right column — Covenant + Actions */}
              <div className="flex flex-col gap-6">
                <CovenantDisplay
                  message={assistantMessage}
                  isStreaming={isStreaming}
                  answers={answers}
                />

                {/* AI Companion — show after covenant is done */}
                {!isStreaming && covenantText && (
                  <CovenantCompanion
                    answers={answers}
                    covenantText={covenantText}
                    displayName={displayName || "Anonymous"}
                  />
                )}

                {/* Actions — show when streaming is done */}
                {!isStreaming && covenantText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <CopyShareActions
                      covenantText={covenantText}
                      onSaveToGallery={handleSaveToGallery}
                      onStartOver={handleStartOver}
                      isSaving={isSaving}
                    />

                    {savedToGallery && (
                      <p className="text-xs text-green-500">
                        Saved to community gallery.
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a
                          href="https://manifest.human.tech"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4" />
                          Visit human.tech
                        </a>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("gallery")}
                        className="gap-2"
                      >
                        <Globe className="size-4" />
                        Browse Community Gallery
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-center gap-6 px-4 py-8"
          >
            <div className="w-full max-w-5xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep("landing")}
              >
                <HomeIcon className="size-5" />
              </Button>
            </div>

            <CommunityGallery />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
