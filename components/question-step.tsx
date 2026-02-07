"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface QuestionStepProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  subtext: string
  value: string
  onChange: (value: string) => void
  direction: "forward" | "backward"
}

const slideVariants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? -300 : 300,
    opacity: 0,
  }),
}

export function QuestionStep({
  questionNumber,
  totalQuestions,
  questionText,
  subtext,
  value,
  onChange,
  direction,
}: QuestionStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={questionNumber}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Question {questionNumber} of {totalQuestions}
              </span>
              <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {questionText}
              </h2>
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                {subtext}
              </p>
            </div>

            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Take your time. Write what comes to mind..."
              className="min-h-[140px] resize-none text-base leading-relaxed"
              autoFocus
            />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
