import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi, 
} from "@/components/ui/carousel"

interface JokesCarouselProps {
  jokes: string[];
}

export function JokesCarousel({ jokes }: JokesCarouselProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null)

  const scrollToStart = () => {
    if (carouselApi) {
      carouselApi.scrollTo(0)
    }
  }

  React.useEffect(() => {
    scrollToStart()
  }, [jokes]) 

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="w-full h-full" // Add h-full here
      setApi={setCarouselApi}
    >
      <CarouselContent className="h-full flex-1 -mt-2 space-y-1"> {/* Add h-full flex-1 */}
        {jokes.length > 0 ? (
          jokes.map((joke, index) => (
            <CarouselItem key={index} className="!basis-auto">
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="text-l font-normal">{joke}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))
        ) : null}
      </CarouselContent>
    </Carousel>
  )
}