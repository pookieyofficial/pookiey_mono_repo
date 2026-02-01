"use client"

import { useEffect, useState } from "react"
import HeroCarousel, { Slide } from "./HeroCarousel"

interface HeroCarouselResponsiveProps {
  slidesMobile: Slide[]
  slidesDesktop: Slide[]
  breakpoint?: number // px, defaults to 768
}

export default function HeroCarouselResponsive({
  slidesMobile,
  slidesDesktop,
  breakpoint = 768,
}: HeroCarouselResponsiveProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [breakpoint])

  if (isMobile === null) {
    // Optional: render desktop by default while hydrating
    return <HeroCarousel slides={slidesDesktop} />
  }

  return <HeroCarousel slides={isMobile ? slidesMobile : slidesDesktop} />
}


