import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi, 
} from "@/components/ui/carousel"

// Define the prop type for JokesCarousel
interface JokesCarouselProps {
  jokes: string[];
}

export function JokesCarousel({ jokes }: JokesCarouselProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null)

  const scrollToStart = () => {
    if (carouselApi) {
      carouselApi.scrollTo(0) // Scroll to the first item
    }
  }

  React.useEffect(() => {
    scrollToStart() // Scroll to the first item
  }, [jokes]) 

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="w-full mt-4 md:mt-0 lg:mt-0"
      setApi={setCarouselApi}
    >
      <CarouselContent className="-mt-2 h-[580] space-y-1">
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
