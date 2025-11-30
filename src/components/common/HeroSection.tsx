"use client"

import { useEffect, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  badgeIcon: React.ComponentType<{ className?: string }>
  badgeText: string
  title: string
  highlight: string
  description: string
  centered?: boolean
  className?: string
  children?: ReactNode
}

export function HeroSection({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  highlight,
  description,
  centered = false,
  className,
  children,
}: HeroSectionProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <section className={cn("bg-gradient-to-b from-blue-50 to-white py-12", className)}>
      <div className={cn("container mx-auto max-w-6xl px-6", centered && "text-center")}>        
        <div className={cn("mb-8", centered && "mx-auto")}>          
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7] transition-all duration-500",
              visible ? "animate-fade-in" : "opacity-0",
              centered && "justify-center"
            )}
          >
            <BadgeIcon className="h-4 w-4" />
            {badgeText}
          </div>
          <h1
            className={cn(
              "mb-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 transition-all duration-700",
              visible ? "animate-fade-in-up" : "opacity-0",
              centered && "text-balance"
            )}
          >
            {title} <span className="text-[#0074B7]">{highlight}</span>
          </h1>
          <p
            className={cn(
              "text-lg leading-relaxed text-gray-600 transition-all duration-700 delay-100",
              visible ? "animate-fade-in" : "opacity-0"
            )}
          >
            {description}
          </p>
        </div>
        {children && <div>{children}</div>}
      </div>
    </section>
  )
}
