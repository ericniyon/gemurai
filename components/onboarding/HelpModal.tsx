"use client"

import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, ExternalLink, Lightbulb, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HelpModalContent {
  title: string
  description?: string
  content: string | ReactNode
  examples?: string[]
  tips?: string[]
  warnings?: string[]
  image?: string
  videoUrl?: string
  relatedTopics?: { label: string; onClick: () => void }[]
}

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  helpContent: HelpModalContent | null
}

export function HelpModal({ open, onOpenChange, helpContent }: HelpModalProps) {
  if (!helpContent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {helpContent.title}
          </DialogTitle>
          {helpContent.description && (
            <DialogDescription>{helpContent.description}</DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {typeof helpContent.content === "string" ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {helpContent.content}
              </p>
            ) : (
              helpContent.content
            )}

            {helpContent.image && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={helpContent.image}
                  alt={helpContent.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {helpContent.videoUrl && (
              <div className="rounded-lg overflow-hidden border aspect-video">
                <iframe
                  src={helpContent.videoUrl}
                  title={helpContent.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {helpContent.examples && helpContent.examples.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <span className="text-muted-foreground">Examples:</span>
                </h4>
                <ul className="space-y-1">
                  {helpContent.examples.map((example, index) => (
                    <li
                      key={index}
                      className="text-sm bg-muted/50 rounded-md px-3 py-2 font-mono"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {helpContent.tips && helpContent.tips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Lightbulb className="h-4 w-4" />
                  Tips
                </h4>
                <ul className="space-y-1">
                  {helpContent.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2"
                    >
                      <span className="text-blue-400 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {helpContent.warnings && helpContent.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Important
                </h4>
                <ul className="space-y-1">
                  {helpContent.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2"
                    >
                      <span className="text-amber-400 mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {helpContent.relatedTopics && helpContent.relatedTopics.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Related Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {helpContent.relatedTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={topic.onClick}
                      className="h-7 text-xs"
                    >
                      {topic.label}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface UseHelpModalReturn {
  openModal: (contentKey: string) => void
  closeModal: () => void
  isOpen: boolean
  currentContent: HelpModalContent | null
}

import { useState, useCallback } from "react"

export function useHelpModal(
  contentMap: Record<string, HelpModalContent>
): UseHelpModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentKey, setCurrentKey] = useState<string | null>(null)

  const openModal = useCallback((contentKey: string) => {
    setCurrentKey(contentKey)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setCurrentKey(null)
  }, [])

  const currentContent = currentKey ? contentMap[currentKey] || null : null

  return {
    openModal,
    closeModal,
    isOpen,
    currentContent,
  }
}
