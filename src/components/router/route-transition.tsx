"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

interface RouteTransitionProps {
  children: React.ReactNode
}

/**
 * Wraps route content with fade-in animation on route changes
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = React.useState(location)
  const [transitionStage, setTransitionStage] = React.useState<"fadeIn" | "fadeOut">("fadeIn")

  React.useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut")
    }
  }, [location, displayLocation])

  return (
    <div
      className={cn(
        "w-full",
        transitionStage === "fadeIn" && "animate-in fade-in duration-300",
        transitionStage === "fadeOut" && "animate-out fade-out duration-200"
      )}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setDisplayLocation(location)
          setTransitionStage("fadeIn")
        }
      }}
    >
      {children}
    </div>
  )
}
