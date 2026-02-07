"use client"

import { useState } from "react"
import {
  Copy,
  Check,
  Share2,
  BookmarkPlus,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyShareActionsProps {
  covenantText: string
  onSaveToGallery: () => void
  onStartOver: () => void
  isSaving: boolean
}

export function CopyShareActions({
  covenantText,
  onSaveToGallery,
  onStartOver,
  isSaving,
}: CopyShareActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(covenantText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: try older execCommand approach
      const textarea = document.createElement("textarea")
      textarea.value = covenantText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "My Technology Covenant",
      text: covenantText,
      url: "https://manifest.human.tech",
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or share failed, fall back to clipboard
        await handleCopy()
      }
    } else {
      await handleCopy()
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="outline"
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
        {copied ? "Copied!" : "Copy to Clipboard"}
      </Button>

      <Button variant="outline" onClick={handleShare} className="gap-2">
        <Share2 className="size-4" />
        Share
      </Button>

      <Button
        variant="outline"
        onClick={onSaveToGallery}
        disabled={isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <BookmarkPlus className="size-4" />
        )}
        {isSaving ? "Saving..." : "Save to Gallery"}
      </Button>

      <Button variant="ghost" onClick={onStartOver} className="gap-2">
        <RotateCcw className="size-4" />
        Start Over
      </Button>
    </div>
  )
}
