"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Aanya",
    quote: "Feels real and simple. Conversations actually start here.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
  },
  {
    name: "Rahul",
    quote: "The clean vibe and trust-first feel made a big difference.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
  },
  {
    name: "Meera",
    quote: "Less noise, better matches. Exactly what I wanted.",
    image:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=600&fit=crop",
  },
  {
    name: "Arjun",
    quote: "Fast, clean, and the UI feels premium without being heavy.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop",
  },
]

export default function LandingTestimonials() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl font-semibold text-[#2A1F2D] md:text-2xl">
            Testimonials
          </h2>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {testimonials.map((t) => (
              <CarouselItem
                key={t.name}
                className="pl-3 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="glass-card border-white/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#2A1F2D]">
                          {t.name}
                        </div>
                        <div className="text-xs text-[#6F6077]">
                          ⭐ ⭐ ⭐ ⭐ ⭐
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#2A1F2D]/80">
                      “{t.quote}”
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}


