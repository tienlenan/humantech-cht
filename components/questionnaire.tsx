"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressIndicator } from "@/components/progress-indicator"
import { QuestionStep } from "@/components/question-step"
import { Suggestion } from "@/components/ai-elements/suggestion"
import { Shimmer } from "@/components/ai-elements/shimmer"

interface QuestionnaireProps {
  onComplete: (answers: string[]) => void
  onBack: () => void
}

const QUESTIONS = [
  {
    label: "Identity",
    text: "How would you describe your relationship with technology? Are you a developer, artist, educator, student, entrepreneur, or something else?",
    subtext:
      "Your role shapes how you interact with and think about technology. There's no wrong answer — you can be many things at once.",
    example:
      "I'm a software developer who spends most of my working hours building products. But outside of work, I'm also a musician. I've seen firsthand how technology can both empower creation and commodify art. I carry both perspectives everywhere I go.",
  },
  {
    label: "Catalyst",
    text: "What moment or experience made you start thinking more carefully about technology's impact on humanity?",
    subtext:
      "Everyone has a turning point — an article, a conversation, a personal experience that shifted their perspective.",
    example:
      "It was watching my nephew, barely three years old, instinctively swiping at a picture book like it was an iPad. That small gesture made me realize how deeply technology was reshaping even the most fundamental human behaviors, starting from infancy.",
  },
  {
    label: "Awareness",
    text: "When you look at the last 24 hours, what moment with technology felt the most human — and what moment felt the least?",
    subtext:
      "Think about when you felt connected, creative, or present versus when you felt drained, distracted, or automated.",
    example:
      "The most human moment was a video call with my mom — seeing her laugh at something silly my cat did felt genuinely warm and connected. The least human was doom-scrolling through social media for 40 minutes before bed. I didn't even enjoy it, I just couldn't stop. I felt hollow afterward.",
  },
  {
    label: "Values",
    text: "If you could design technology that perfectly serves your deepest values, what would it prioritize? What would it refuse to do?",
    subtext:
      "Consider your values around privacy, creativity, community, autonomy, or anything else that matters to you.",
    example:
      "It would prioritize deep focus and creative flow — tools that help me think better, not faster. It would protect my privacy fiercely and never sell my attention to advertisers. It would refuse to use dark patterns to keep me engaged. It would treat my time as sacred and my data as mine alone.",
  },
  {
    label: "Boundaries",
    text: "What is one boundary you wish you could set with technology but haven't? What gets in the way?",
    subtext:
      "This could be about screen time, data sharing, attention, relationships, or work-life separation.",
    example:
      "I wish I could stop checking work emails after 7 PM. The boundary is clear in my head but impossible in practice — the notifications pull me back, and there's this fear that if I don't respond quickly, I'll seem uncommitted. The technology makes it too easy and the culture rewards always-on behavior.",
  },
  {
    label: "Agency",
    text: "Describe a time when technology amplified your ability to do something meaningful. What made it different from times it felt like technology was using you?",
    subtext:
      "Think about the difference between being a tool-user and being the tool.",
    example:
      "I used a simple note-taking app to organize my thoughts while writing a letter to a friend going through a hard time. The technology disappeared — it was just me and my words. Compare that to social media, where I craft posts for likes instead of genuine expression. The difference is intention: I chose the tool versus the tool choosing my behavior.",
  },
  {
    label: "Legacy",
    text: "What kind of technological world do you want to help create for the next generation?",
    subtext:
      "Imagine writing a letter to someone 20 years from now about what technology should and should not become.",
    example:
      "I want a world where children grow up knowing that technology serves them, not the other way around. Where AI helps teachers personalize learning but never replaces the warmth of a human mentor. Where privacy is a right, not a premium feature. I never want the next generation to feel like their worth is measured in followers or likes.",
  },
]

export function Questionnaire({ onComplete, onBack }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""))
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [usedSuggestionIndexes, setUsedSuggestionIndexes] = useState<Set<number>>(new Set())
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const currentAnswer = answers[currentQuestion]
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1
  const minLength = currentQuestion === 0 ? 3 : 20
  const canProceed = currentAnswer.trim().length >= minLength

  const fetchSuggestions = useCallback(
    async (questionIndex: number, text: string) => {
      // Abort previous request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoadingSuggestions(true)
      try {
        const previousAnswers = answers
          .slice(0, questionIndex)
          .map((a, i) => ({
            label: QUESTIONS[i].label,
            answer: a,
          }))
          .filter((a) => a.answer.trim().length > 0)

        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionLabel: QUESTIONS[questionIndex].label,
            questionText: QUESTIONS[questionIndex].text,
            currentText: text,
            previousAnswers,
          }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Failed to fetch suggestions")
        const data = await res.json()
        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions ?? [])
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false)
        }
      }
    },
    [answers]
  )

  // Debounced suggestions fetch on typing pause
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Only fetch if the answer is short enough (user is still thinking)
    // or empty (needs inspiration)
    if (currentAnswer.trim().length <= 100) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(currentQuestion, currentAnswer)
      }, 1200)
    } else {
      setSuggestions([])
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [currentAnswer, currentQuestion, fetchSuggestions])

  // Reset suggestions when changing questions
  useEffect(() => {
    setSuggestions([])
    setUsedSuggestionIndexes(new Set())
    setIsLoadingSuggestions(false)
    abortRef.current?.abort()
  }, [currentQuestion])

  const handleAnswerChange = (value: string) => {
    const updated = [...answers]
    updated[currentQuestion] = value
    setAnswers(updated)
  }

  const handleFillExample = () => {
    const updated = [...answers]
    updated[currentQuestion] = QUESTIONS[currentQuestion].example
    setAnswers(updated)
    setSuggestions([])
    setUsedSuggestionIndexes(new Set())
  }

  const handleFillAll = () => {
    setAnswers(QUESTIONS.map((q) => q.example))
    setSuggestions([])
    setUsedSuggestionIndexes(new Set())
  }

  const handleSuggestionClick = (suggestion: string, index: number) => {
    const updated = [...answers]
    const current = updated[currentQuestion]
    // If empty or very short, replace. Otherwise append.
    if (current.trim().length < 10) {
      updated[currentQuestion] = suggestion
    } else {
      updated[currentQuestion] = current.trimEnd() + " " + suggestion
    }
    setAnswers(updated)
    // Mark this suggestion as used, keep showing remaining
    setUsedSuggestionIndexes((prev) => new Set(prev).add(index))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers)
    } else {
      setDirection("forward")
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestion === 0) {
      onBack()
    } else {
      setDirection("backward")
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <ProgressIndicator
        currentStep={currentQuestion}
        totalSteps={QUESTIONS.length}
      />

      <QuestionStep
        questionNumber={currentQuestion + 1}
        totalQuestions={QUESTIONS.length}
        questionText={QUESTIONS[currentQuestion].text}
        subtext={QUESTIONS[currentQuestion].subtext}
        value={currentAnswer}
        onChange={handleAnswerChange}
        direction={direction}
      />

      {/* AI Suggestions */}
      <div className="min-h-[40px]">
        {isLoadingSuggestions && suggestions.length === 0 && (
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="size-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <Shimmer duration={1.5}>Getting suggestions...</Shimmer>
            </span>
          </div>
        )}
        {suggestions.length > 0 && usedSuggestionIndexes.size < suggestions.length && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <Sparkles className="size-3" />
              AI suggestions — click to add (max 3)
            </span>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) =>
                usedSuggestionIndexes.has(i) ? null : (
                  <Suggestion
                    key={`${currentQuestion}-${i}`}
                    suggestion={s}
                    onClick={(text) => handleSuggestionClick(text, i)}
                    className="h-auto w-full justify-start whitespace-normal rounded-lg py-2 text-left text-xs leading-relaxed"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFillExample}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <Lightbulb className="size-3" />
            Example
          </Button>

          {currentQuestion === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFillAll}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Lightbulb className="size-3" />
              Fill All
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {isLastQuestion ? (
              <>
                Generate My Covenant
                <Sparkles className="size-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
