"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Heart,
  Users,
  ExternalLink,
  Quote,
  BookOpen,
  Fingerprint,
  KeyRound,
  Lock,
  Share2,
  Coins,
  ShieldCheck,
  Scale,
  Leaf,
  Network,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { TbShieldHeart } from "react-icons/tb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCovenants, type Covenant } from "@/lib/covenants"
import { CommunityInsights } from "@/components/community-insights"

const COVENANT_PRINCIPLES = [
  {
    number: "I",
    icon: Fingerprint,
    title: "Universal Personhood",
    summary:
      "Your status as a person is neither issued nor revoked by any institution — it is inherent.",
  },
  {
    number: "II",
    icon: KeyRound,
    title: "Inalienable Ownership",
    summary:
      "To own oneself is to own one's keys, that are yours and yours only.",
  },
  {
    number: "III",
    icon: Lock,
    title: "Privacy by Default",
    summary:
      "Personal data and identities are not viewable without explicit consent.",
  },
  {
    number: "IV",
    icon: Share2,
    title: "Free Flow of Information",
    summary:
      "Open exchange of art, science, code, and ideas is essential for human advancement.",
  },
  {
    number: "V",
    icon: Coins,
    title: "Free Flow of Capital",
    summary:
      "Open exchange of resources supporting collective advancement.",
  },
  {
    number: "VI",
    icon: Heart,
    title: "Capital Serves Public Goods",
    summary:
      "Public goods are the greatest basins for capital flow — open-source, science, and well-being.",
  },
  {
    number: "VII",
    icon: ShieldCheck,
    title: "Universal Security",
    summary:
      "To act freely, one must be secure against key loss, surveillance, and intrusion.",
  },
  {
    number: "VIII",
    icon: Scale,
    title: "Voluntary Accountability",
    summary:
      "Consent fosters cooperation; accountability prevents exploitation.",
  },
  {
    number: "IX",
    icon: Leaf,
    title: "Earth Public Goods",
    summary:
      "Progress that undermines the planet's ability to sustain life cannot be called progress.",
  },
  {
    number: "X",
    icon: Network,
    title: "Adaptive Resilience",
    summary:
      "Networks must empower human agency, not collude with power.",
  },
]

const FEATURED_READS = [
  {
    title: "Read the Full Covenant",
    source: "manifest.human.tech",
    url: "https://manifest.human.tech/read-covenant",
    description:
      "The foundational document — an adaptive protocol with 10 principles to guide human-first technology.",
  },
  {
    title: "Sign the Declaration",
    source: "manifest.human.tech",
    url: "https://manifest.human.tech/manifesto",
    description:
      "Join verified humans in signing the covenant and submitting artifacts for a human-aligned future.",
  },
  {
    title: "Humane Technology Community",
    source: "Center for Humane Technology",
    url: "https://www.humanetech.com",
    description:
      "A world where technology strengthens our well-being, democratic functioning, and shared information.",
  },
  {
    title: "The Ethical OS Toolkit",
    source: "Institute for the Future",
    url: "https://ethicalos.org",
    description:
      "Anticipate the future impact of today's technology — risk zones, scenarios, and strategies.",
  },
]

export function CommunityGallery() {
  const [covenants, setCovenants] = useState<Covenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getCovenants(20)
      .then((data) => setCovenants(data))
      .catch((err) => console.error("Failed to fetch covenants:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleUpvote = async (id: string) => {
    if (votedIds.has(id)) return
    // Optimistic update
    setVotedIds((prev) => new Set(prev).add(id))
    setCovenants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c))
    )
    try {
      const res = await fetch("/api/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Upvote failed")
    } catch {
      // Revert on error
      setVotedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setCovenants((prev) =>
        prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes - 1 } : c))
      )
    }
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-16">
      {/* Hero Quote */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="flex items-center gap-2">
          <TbShieldHeart className="size-6 text-primary" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            The Covenant of Humanistic Technologies
          </span>
        </div>

        <blockquote className="relative max-w-2xl">
          <Quote className="absolute -top-2 -left-4 size-8 text-primary/20" />
          <p className="text-2xl leading-relaxed font-light italic text-foreground sm:text-3xl">
            Humanistic technology is technology embedded with natural rights for
            its users, by design.
          </p>
          <cite className="mt-3 block text-sm not-italic text-muted-foreground">
            — The Covenant, v.004
          </cite>
        </blockquote>

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Human Tech fortifies human agency with the establishment of digital
          human rights — elevated to the status of natural rights that are
          universal, inalienable, and self-evident.
        </p>
      </motion.section>

      {/* The 10 Principles */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex flex-col gap-6"
      >
        <h3 className="text-center text-lg font-semibold text-foreground">
          The Ten Principles
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {COVENANT_PRINCIPLES.map(
            ({ number, icon: Icon, title, summary }, idx) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
              >
                <div className="flex gap-3 rounded-lg border border-border/40 bg-card/40 p-4 transition-colors hover:border-primary/30 hover:bg-card/60">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-primary/60">
                        {number}.
                      </span>
                      <h4 className="text-sm font-medium text-foreground">
                        {title}
                      </h4>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a
              href="https://manifest.human.tech/read-covenant"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the Full Covenant
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </motion.section>

      {/* Featured Reads */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Learn More
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURED_READS.map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-lg border border-border/40 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-card/80"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {article.title}
                </h4>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {article.description}
              </p>
              <span className="text-xs text-muted-foreground/60">
                {article.source}
              </span>
            </a>
          ))}
        </div>
      </motion.section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border/50" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span className="text-sm font-medium">Community Covenants</span>
        </div>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Community Insights */}
      <CommunityInsights />

      {/* Covenants List */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="flex flex-col gap-4"
      >
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-border/30 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted" />
                  <div className="space-y-1">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && covenants.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
              <Users className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No covenants yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to reflect and share your technology covenant with
                the community.
              </p>
            </div>
          </div>
        )}

        {!isLoading && covenants.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {covenants.map((covenant, idx) => (
              <motion.div
                key={covenant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="border-border/40 bg-card/60 transition-colors hover:border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {covenant.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {covenant.display_name}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {new Date(covenant.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(covenant.id)}
                        disabled={votedIds.has(covenant.id)}
                        className="gap-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <Heart
                          className={`size-4 ${
                            votedIds.has(covenant.id)
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                        <span className="text-xs">{covenant.upvotes}</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {expandedIds.has(covenant.id)
                        ? covenant.covenant_text
                        : covenant.covenant_text.length > 300
                          ? covenant.covenant_text.slice(0, 300) + "..."
                          : covenant.covenant_text}
                    </p>
                    {covenant.covenant_text.length > 300 && (
                      <button
                        onClick={() => toggleExpanded(covenant.id)}
                        className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
                      >
                        {expandedIds.has(covenant.id) ? (
                          <>
                            Show less
                            <ChevronUp className="size-3" />
                          </>
                        ) : (
                          <>
                            Read full covenant
                            <ChevronDown className="size-3" />
                          </>
                        )}
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
