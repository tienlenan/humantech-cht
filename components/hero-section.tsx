"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TbShieldHeart } from "react-icons/tb"

interface HeroSectionProps {
  onStart: () => void
  onViewGallery: () => void
}

export function HeroSection({ onStart, onViewGallery }: HeroSectionProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 to-white px-6 text-center dark:from-slate-950 dark:to-slate-900">
      {/* Hero background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/humantech-hero.png"
          alt=""
          fill
          className="object-cover opacity-20 dark:opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white dark:from-slate-950/80 dark:via-slate-900/60 dark:to-slate-900" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex max-w-2xl flex-col items-center gap-8"
      >
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
          How we use technology is how we manifest the future
        </h1>

        <p className="max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Reflect on your relationship with technology. Let AI help you craft a
          personal covenant — a pledge for a more human future.
        </p>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={onStart}
            className="h-14 gap-3 rounded-full px-8 text-base font-semibold"
          >
            Begin Your Reflection
            <ArrowRight className="size-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onViewGallery}
            className="h-14 gap-3 rounded-full border-slate-300 px-8 text-base font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Users className="size-5" />
            Community Gallery
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-10 z-10 flex items-center gap-2"
      >
        <TbShieldHeart className="size-5 text-slate-400" />
        <a
          href="https://manifest.human.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
        >
          A contribution to the Covenant of Humanistic Technologies
        </a>
      </motion.div>
    </div>
  )
}
